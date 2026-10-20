# デプロイ構成と設置手順

西研サイトの公開の仕組み。サーバを移設するとき、または公開が止まったときに読む。日常の更新手順は `docs/update.md`。

## 全体像

```
[学生] GitHub の Web UI で Markdown を編集 → main に Commit
   ↓ 自動
[GitHub Actions] Astro をビルド → built ブランチに生成物をコミット
   ↓ 自動（5分おき）
[Webサーバ] cron が built ブランチを取得 → 公開ディレクトリへ rsync
   ↓
[公開] https://
```

サーバ側は git と rsync だけで動く。ビルドを GitHub 側で行うため、Node.js は不要。

## 設計の理由

毎年担当者が変わることを前提にした構成。

### なぜ「プル型」なのか（サーバから取りに行く）

GitHub Actions からサーバへ push する構成にすると、サーバの SSH 秘密鍵を GitHub Secrets に置くことになる。
本サーバは踏み台経由でのアクセスなので、共用の踏み台の鍵まで GitHub に預けることになり、GitHub が侵害されたときの被害が大きい。

プル型なら、サーバは GitHub の認証情報を何も持たない。サーバが侵害されてもリポジトリに書き込まれることはない。

### なぜ同期スクリプトを GitHub から自動更新しないのか

サーバに置く `sync.sh` は手でコピーし、clone 先（`built` ブランチ＝HTMLのみ）とは別のディレクトリに置く。

自動更新にすると、リポジトリに書き込める人全員がサーバ上でコマンドを実行できてしまう。
手でコピーしておけば、GitHub が侵害されても書き換えられるのは公開する HTML だけで済む。

### なぜ `.git` を公開ディレクトリの外に置くのか

clone したディレクトリをそのまま公開すると、`.git/` の中身が Web から読めてしまう。
clone 先（`/opt/westlab-site`）と公開ディレクトリ（`/var/www/west`）を分け、rsync で HTML だけを渡している。

### 改ざんへの耐性

`rsync --delete` で毎回同期し直すため、公開ディレクトリを書き換えられても次回の同期（最大5分後）で自動的に元に戻る。
サイトの元データは GitHub にあるので、サーバを作り直しても再設置すれば復旧できる。

---

## サーバ側の設置手順

以降の作業は、専用の一般ユーザ `westlab-deploy` で行う。sudo 権限は与えない。

```sh
sudo useradd --system --create-home --shell /bin/sh westlab-deploy
```

cron を root で動かさないこと。git は `.git/config` に書かれた設定（`core.sshCommand` など）を
コマンドとして実行するため、clone 先に書き込める人がいると、それがそのまま cron 実行ユーザの権限になる。

### 1. clone する

```sh
sudo mkdir -p /opt/westlab-site
sudo chown westlab-deploy:westlab-deploy /opt/westlab-site
sudo chmod 755 /opt/westlab-site
sudo -u westlab-deploy git clone --branch built --single-branch https://github.com/westlab/website.git /opt/westlab-site
```

`/opt/westlab-site` は `westlab-deploy` 以外が書き込めない状態にしておく（特に Apache の `www-data`）。

### 2. 同期スクリプトを設置する

`deploy/sync.sh` をサーバに手でコピーし、冒頭の `REPO_DIR` / `PUBLIC_DIR` / `BRANCH` を環境に合わせて書き換える。
clone 先とは別のディレクトリに置き、GitHub から自動更新はしない。

```sh
sudo install -o root -g root -m 755 sync.sh /opt/westlab-site-deploy/sync.sh
sudo -u westlab-deploy /opt/westlab-site-deploy/sync.sh   # 手動で1回実行して動作確認
```

スクリプト本体は root 所有にし、実行ユーザからは書き込めないようにしておく。

公開ディレクトリは `westlab-deploy` が書き込み、Apache は読み取りだけにする。

```sh
sudo chown -R westlab-deploy:www-data /var/www/west
sudo chmod -R u=rwX,g=rX,o=rX /var/www/west
```

### 3. cron に登録する

```
*/5 * * * * /opt/westlab-site-deploy/sync.sh >> /var/log/westlab-deploy.log 2>&1
```

変更がないときは何も出力しないので、ログには反映の記録だけが残る。

---

## GitHub Actions（ビルド）

ビルドは `.github/workflows/build.yml`。main への push で実行され、`dist/` を `built` ブランチに出力する。

---

## 確認と障害対応

### 更新が反映されないとき

上から順に確認する。

1. GitHub Actions が成功しているか — リポジトリの Actions タブ。失敗していればビルドエラー
2. built ブランチが更新されているか — GitHub 上でブランチを切り替えて最終コミット日時を見る
3. サーバの cron が動いているか — `tail /var/log/westlab-deploy.log`
4. サーバから GitHub に到達できるか — `git ls-remote https://github.com/westlab/website.git built`

---

## 未確定事項

サーバ管理者への確認が済んだら、この節を埋めて上記のパスを確定させること。

- [ ] 公開ディレクトリの絶対パス
- [ ] サーバから `github.com` へ HTTPS で到達できるか（proxy 必須か）
- [ ] HTTPS証明書の自動更新が設定されているか
