#!/usr/bin/env python3
"""
Sync files from Google Drive folder using a Service Account.
Saves downloaded files into `raw_papers/`.

Anti-Duplication & Performance Features:
1. In-place overwrite (no 'file (1).md' duplicates).
2. Manifest caching (.sync_manifest.json) using Drive modifiedTime / md5Checksum to skip unchanged files.
3. Drive duplicate name resolution (different Drive files sharing same name get a unique ID suffix).
"""

import io
import json
import os
import sys
from pathlib import Path

MANIFEST_FILE = "raw_papers/.sync_manifest.json"


def load_manifest() -> dict:
    p = Path(MANIFEST_FILE)
    if p.exists():
        try:
            return json.loads(p.read_text(encoding="utf-8"))
        except Exception:
            return {}
    return {}


def save_manifest(manifest: dict):
    p = Path(MANIFEST_FILE)
    p.parent.mkdir(parents=True, exist_ok=True)
    p.write_text(json.dumps(manifest, ensure_ascii=False, indent=2), encoding="utf-8")


def sync_drive():
    folder_id = os.environ.get("GDRIVE_FOLDER_ID")
    service_account_raw = os.environ.get("GDRIVE_SERVICE_ACCOUNT_KEY")

    dest_dir = Path("raw_papers")
    dest_dir.mkdir(parents=True, exist_ok=True)

    if not folder_id or not service_account_raw:
        print("⚠️ [WARNING] Google Drive credentials not found:")
        if not service_account_raw:
            print("   - GDRIVE_SERVICE_ACCOUNT_KEY is missing")
        if not folder_id:
            print("   - GDRIVE_FOLDER_ID is missing")
        print(
            "\nℹ️ Please configure them in GitHub Repo Settings > Secrets and variables > Actions."
        )
        print(
            f"ℹ️ Skipping Google Drive sync. Using {len(list(dest_dir.glob('*.md')))} existing files in {dest_dir}/."
        )
        return

    try:
        from google.oauth2 import service_account
        from googleapiclient.discovery import build
        from googleapiclient.http import MediaIoBaseDownload
    except ImportError:
        print("❌ [ERROR] Missing Google API dependencies.")
        print("Run: pip install google-api-python-client google-auth")
        sys.exit(1)

    try:
        service_account_info = json.loads(service_account_raw)
    except Exception as e:
        print(f"❌ [ERROR] Failed to parse GDRIVE_SERVICE_ACCOUNT_KEY JSON: {e}")
        sys.exit(1)

    scopes = ["https://www.googleapis.com/auth/drive.readonly"]
    creds = service_account.Credentials.from_service_account_info(
        service_account_info, scopes=scopes
    )
    service = build("drive", "v3", credentials=creds)

    print(f"🔍 Searching Google Drive folder: {folder_id} ...")
    query = f"'{folder_id}' in parents and trashed = false"

    try:
        results = (
            service.files()
            .list(
                q=query,
                fields="files(id, name, mimeType, modifiedTime, md5Checksum, size)",
            )
            .execute()
        )
    except Exception as e:
        print(f"❌ [ERROR] Drive API list call failed: {e}")
        sys.exit(1)

    files = results.get("files", [])
    print(f"📄 Found {len(files)} files in Google Drive folder.")

    manifest = load_manifest()
    new_manifest = {}
    downloaded_count = 0
    skipped_count = 0

    # Detect duplicate filenames within the same Drive folder
    name_occurrences = {}
    for f in files:
        name_occurrences[f["name"]] = name_occurrences.get(f["name"], 0) + 1

    for file in files:
        file_id = file["id"]
        file_name = file["name"]
        mime_type = file["mimeType"]
        modified_time = file.get("modifiedTime", "")
        md5 = file.get("md5Checksum", "")

        # Handle duplicate filenames in Drive: if multiple files share the same name, add short id
        base_name = file_name
        if name_occurrences[file_name] > 1:
            name_parts = os.path.splitext(file_name)
            base_name = f"{name_parts[0]}_{file_id[:6]}{name_parts[1]}"

        # Normalize target file path
        if mime_type == "application/vnd.google-apps.document":
            safe_name = base_name if base_name.endswith(".md") else f"{base_name}.md"
            file_path = dest_dir / safe_name
            is_gdoc = True
        else:
            if not (base_name.endswith(".md") or base_name.endswith(".txt")):
                print(f"⏭️ Skipping non-markdown file: {file_name} ({mime_type})")
                continue
            file_path = dest_dir / base_name
            is_gdoc = False

        # Anti-Duplication & Incremental Cache Check:
        # If file exists on disk and modifiedTime has not changed, skip re-download
        cached_info = manifest.get(file_id)
        if (
            cached_info
            and cached_info.get("modifiedTime") == modified_time
            and file_path.exists()
        ):
            print(
                f"⏭️ [UNCHANGED] {file_path.name} (modified: {modified_time}) - Skipping download."
            )
            new_manifest[file_id] = cached_info
            skipped_count += 1
            continue

        # Download / Export file
        if is_gdoc:
            print(f"📥 Exporting Google Doc '{file_name}' -> {file_path.name} ...")
            request = service.files().export_media(
                fileId=file_id, mimeType="text/plain"
            )
        else:
            print(f"📥 Downloading '{file_name}' -> {file_path.name} ...")
            request = service.files().get_media(fileId=file_id)

        fh = io.BytesIO()
        downloader = MediaIoBaseDownload(fh, request)
        done = False
        while not done:
            _, done = downloader.next_chunk()

        file_path.write_bytes(fh.getvalue())
        downloaded_count += 1
        new_manifest[file_id] = {
            "name": file_path.name,
            "modifiedTime": modified_time,
            "md5Checksum": md5,
        }
        print(f"✅ Successfully saved: {file_path.name}")

    save_manifest(new_manifest)
    print(
        f"\n🎉 Sync completed: {downloaded_count} updated, {skipped_count} unchanged (skipped)."
    )


if __name__ == "__main__":
    sync_drive()
