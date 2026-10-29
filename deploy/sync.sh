#!/bin/sh
#
# github repository -> www 同期スクリプト
#
# 設置手順は docs/deploy.md を参照。

set -eu

# --- TODO: セットアップ時に環境に合わせて書き換える ---------------------------------------
REPO_DIR="/opt/westlab-site"      # clone 先。公開ディレクトリの外に置くこと
PUBLIC_DIR="/var/www/west"        # 公開ディレクトリ（ドキュメントルート）
BRANCH="built"                    # ビルド済みHTMLが入っているブランチ
# ---------------------------------------------------------------------------

# PUBLIC_DIR の設定ミスで rsync --delete が想定外のディレクトリを空にしないための保険。
case "$PUBLIC_DIR" in
	""|"/"|"/var"|"/var/www"|*..*)
		echo "PUBLIC_DIR の指定が不正: '$PUBLIC_DIR'" >&2
		exit 1
		;;
esac
[ -d "$PUBLIC_DIR" ] || { echo "PUBLIC_DIR が存在しない: $PUBLIC_DIR" >&2; exit 1; }

cd "$REPO_DIR"

# 常に GitHub の内容が正になる。
git fetch --quiet origin "$BRANCH"

# 変更があるか確認
LOCAL="$(git rev-parse HEAD)"
REMOTE="$(git rev-parse "origin/$BRANCH")"
if [ "$LOCAL" = "$REMOTE" ]; then
	exit 0
fi

git reset --hard --quiet "origin/$BRANCH"

# --delete で、GitHub 側から消えたファイルは公開ディレクトリからも消える。
# --delay-updates / --delete-delay は、更新と削除を転送の最後にまとめて行う。
rsync -a --delete-delay --delay-updates --exclude '.git' "$REPO_DIR/" "$PUBLIC_DIR/"

echo "$(date '+%Y-%m-%d %H:%M:%S') deployed ${REMOTE}"
