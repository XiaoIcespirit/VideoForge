#!/usr/bin/env python3
"""Resolve and download watermark-free Douyin videos."""

import argparse
import json
import re
import sys
from pathlib import Path
from typing import Optional


def check_dependencies() -> None:
    missing = []
    try:
        import requests  # noqa: F401
    except ImportError:
        missing.append("requests")

    if missing:
        print(f"缺少依赖: {', '.join(missing)}", file=sys.stderr)
        print(f"请运行: pip install {' '.join(missing)}", file=sys.stderr)
        sys.exit(1)


check_dependencies()

import requests


HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (iPhone; CPU iPhone OS 17_2 like Mac OS X) "
        "AppleWebKit/605.1.15 (KHTML, like Gecko) EdgiOS/121.0.2277.107 "
        "Version/17.0 Mobile/15E148 Safari/604.1"
    )
}


def emit(message: str, *, quiet: bool = False, json_mode: bool = False) -> None:
    if quiet:
        return
    print(message, file=sys.stderr if json_mode else sys.stdout)


def extract_first_url(text: str) -> Optional[str]:
    urls = re.findall(
        r"https?://(?:[a-zA-Z]|[0-9]|[$-_@.&+]|[!*\(\),]|(?:%[0-9a-fA-F][0-9a-fA-F]))+",
        text,
    )
    return urls[0] if urls else None


def extract_video_id(source: str) -> tuple[str, str]:
    """Return (video_id, source_url)."""
    modal_match = re.search(r"[?&]modal_id=(\d+)", source)
    if modal_match:
        return modal_match.group(1), source

    direct_match = re.search(r"douyin\.com/video/(\d+)", source)
    if direct_match:
        return direct_match.group(1), source

    numeric_match = re.fullmatch(r"\d{10,}", source.strip())
    if numeric_match:
        video_id = numeric_match.group(0)
        return video_id, f"https://www.douyin.com/video/{video_id}"

    url = extract_first_url(source)
    if not url:
        raise ValueError("未找到有效的抖音链接或视频 ID")

    modal_match = re.search(r"[?&]modal_id=(\d+)", url)
    if modal_match:
        return modal_match.group(1), url

    direct_match = re.search(r"douyin\.com/video/(\d+)", url)
    if direct_match:
        return direct_match.group(1), url

    response = requests.get(url, headers=HEADERS, timeout=30)
    response.raise_for_status()
    redirected_url = response.url

    redirected_match = re.search(r"(?:douyin\.com/video/|/share/video/)(\d+)", redirected_url)
    if redirected_match:
        return redirected_match.group(1), redirected_url

    path_id = redirected_url.split("?")[0].strip("/").split("/")[-1]
    if re.fullmatch(r"\d{10,}", path_id):
        return path_id, redirected_url

    raise ValueError("无法从链接中解析抖音视频 ID")


def sanitize_title(title: str) -> str:
    return re.sub(r'[\\/:*?"<>|]', "_", title.strip()) or "douyin_video"


class DouyinProcessor:
    """Resolve Douyin video info and download videos."""

    def parse_share_url(self, share_text: str) -> dict:
        video_id, source_url = extract_video_id(share_text)
        share_url = f"https://www.iesdouyin.com/share/video/{video_id}"

        response = requests.get(share_url, headers=HEADERS, timeout=30)
        response.raise_for_status()

        match = re.search(r"window\._ROUTER_DATA\s*=\s*(.*?)</script>", response.text, flags=re.DOTALL)
        if not match or not match.group(1):
            raise ValueError("从 HTML 中解析视频信息失败")

        router_data = json.loads(match.group(1).strip())
        loader_data = router_data.get("loaderData", {})

        if "video_(id)/page" in loader_data:
            video_info = loader_data["video_(id)/page"]["videoInfoRes"]
        elif "note_(id)/page" in loader_data:
            video_info = loader_data["note_(id)/page"]["videoInfoRes"]
        else:
            raise ValueError("无法从 JSON 中解析视频或图集信息")

        item = video_info["item_list"][0]
        raw_url = item["video"]["play_addr"]["url_list"][0]
        download_url = raw_url.replace("playwm", "play")
        title = sanitize_title(item.get("desc", "") or f"douyin_{video_id}")

        return {
            "platform": "douyin",
            "video_id": video_id,
            "title": title,
            "download_url": download_url,
            "url": download_url,
            "source_url": source_url,
        }

    def download_video(
        self,
        video_info: dict,
        output_dir: Path,
        *,
        quiet: bool = False,
        json_mode: bool = False,
    ) -> Path:
        output_dir.mkdir(parents=True, exist_ok=True)
        video_path = output_dir / f"{video_info['video_id']}.mp4"

        emit(f"正在下载视频: {video_info['title']}", quiet=quiet, json_mode=json_mode)

        response = requests.get(video_info["download_url"], headers=HEADERS, stream=True, timeout=60)
        response.raise_for_status()

        total_size = int(response.headers.get("content-length", 0))
        downloaded = 0
        with open(video_path, "wb") as file:
            for chunk in response.iter_content(chunk_size=8192):
                if not chunk:
                    continue
                file.write(chunk)
                downloaded += len(chunk)
                if not quiet and total_size > 0:
                    progress = downloaded / total_size * 100
                    print(f"\r下载进度: {progress:.1f}%", end="", flush=True, file=sys.stderr if json_mode else sys.stdout)

        emit(f"\n视频下载完成: {video_path}", quiet=quiet, json_mode=json_mode)
        return video_path


def get_video_info(share_link: str) -> dict:
    return DouyinProcessor().parse_share_url(share_link)


def download_video(
    share_link: str,
    output_dir: str = ".",
    *,
    quiet: bool = False,
    json_mode: bool = False,
) -> dict:
    processor = DouyinProcessor()
    video_info = processor.parse_share_url(share_link)
    video_path = processor.download_video(video_info, Path(output_dir), quiet=quiet, json_mode=json_mode)
    return {
        **video_info,
        "video_path": str(video_path.resolve()),
        "file_size": video_path.stat().st_size,
    }


def print_human_info(info: dict) -> None:
    print("\n" + "=" * 50)
    print("视频信息:")
    print("=" * 50)
    print(f"视频ID: {info['video_id']}")
    print(f"标题: {info['title']}")
    print(f"下载链接: {info['download_url']}")
    print("=" * 50)


def main() -> None:
    parser = argparse.ArgumentParser(
        description="抖音无水印视频解析和下载工具",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
示例:
  python douyin_downloader.py --link "抖音分享链接" --action info
  python douyin_downloader.py --link "抖音分享链接" --action info --json
  python douyin_downloader.py --link "抖音分享链接" --action download --output ./videos
  python douyin_downloader.py --link "抖音分享链接" --action download --output ./videos --json
        """,
    )

    parser.add_argument("--link", "-l", required=True, help="抖音分享链接、完整视频链接或视频 ID")
    parser.add_argument(
        "--action",
        "-a",
        choices=["info", "download"],
        default="info",
        help="操作类型: info(获取信息), download(下载视频)",
    )
    parser.add_argument("--output", "-o", default="./output", help="输出目录 (默认 ./output)")
    parser.add_argument("--json", action="store_true", help="输出机器可读 JSON")
    parser.add_argument("--quiet", "-q", action="store_true", help="安静模式，减少输出")

    args = parser.parse_args()

    try:
        if args.action == "info":
            result = get_video_info(args.link)
        else:
            result = download_video(args.link, args.output, quiet=args.quiet or args.json, json_mode=args.json)

        if args.json:
            print(json.dumps(result, ensure_ascii=False, indent=2))
        elif args.action == "info":
            print_human_info(result)
        else:
            print(f"\n视频已保存到: {result['video_path']}")
    except Exception as error:
        print(f"\n错误: {error}", file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()
