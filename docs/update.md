# データの更新方法

## 更新の流れ

1. 下の対応表から該当するファイルを探して編集する。ローカルで確認するなら `docker compose up` で起動し、`http://localhost:4321` を見ながら編集する
2. `src/content/` のファイルは、日本語版と英語版の両方を編集する。片方だけだと `git push` 時に警告が出る（push は止まらない）
3. `main` ブランチにコミットする

## 掲載内容の制約

- OB・OGが写っている写真は掲載しない

## Homepage

| 変更したいこと | 触るファイル |
| --- | --- |
| 教授からのメッセージ本文 | `src/content/pages/{ja,en}/homepage-message.md` |

## Research

| 変更したいこと | 触るファイル |
| --- | --- |
| 導入文 | `src/content/pages/{ja,en}/research-intro.md` |
| トピック本文（7項目）の追加・修正 | `src/content/research/{ja,en}/*.md`（ja/en 両方。並び順は front matter の `order`） |
| トピックの図版 | `public/images/research/<topic>/`（画像は1枚500KB・長辺2400px以内。長辺2400px超、または500KB超で圧縮すれば5%以上小さくなる場合は `npm test` が失敗する（コミット時と CI で実行）。`npm run compress:images` で圧縮できる。圧縮しても5%以上小さくならない画像は500KBを超えても通る。写真は長辺1920px・JPEG、図版は長辺1600px・PNG目安） |
| 「過去の研究」節 | `src/data/past-research.yaml` |
| Page Title（Hero）の画像・タイトル | `src/data/pages.yaml`（`id: research`） |

## Members

| 変更したいこと | 触るファイル |
| --- | --- |
| メンバーの追加・削除・学年変更 | `src/data/members.yaml` |
| 個人の顔写真 | `public/images/members/<id>.jpg` を追加し `photo` を更新（現状Figma上は非表示） |
| Page Title（Hero）の画像・タイトル | `src/data/pages.yaml`（`id: members`） |

## Alumni

| 変更したいこと | 触るファイル |
| --- | --- |
| OB・OGの追加（期・氏名） | `src/data/alumni.yaml` |

## Publications

| 変更したいこと | 触るファイル |
| --- | --- |
| 業績の追加・修正 | `src/data/publications.yaml` |

## Videos

| 変更したいこと | 触るファイル |
| --- | --- |
| 動画の追加・差し替え | `src/data/videos.yaml` |

## Applicants（入室・見学）

| 変更したいこと | 触るファイル |
| --- | --- |
| 入室・見学案内本文 | `src/content/pages/{ja,en}/applicants.md` |

## Links

| 変更したいこと | 触るファイル |
| --- | --- |
| リンク集の項目追加・URL修正 | `src/data/links.yaml` |
