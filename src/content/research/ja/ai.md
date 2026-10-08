---
title: 機械学習・連合学習
order: 4
icon: ai
summary: エッジ環境の限られた計算資源でも動作する、省メモリ・高効率な機械学習手法を研究しています。
hero: /images/research/ai/hero.jpg
---

深層学習の活用による多様な領域の課題解決に取り組み、実社会で利用できる、高精度かつ効率的なAI技術の実現を目指しています。

## Sigma-Branch：階層型単一経路ネットワーク再構成による動的推論の効率化

### キーワード

動的推論／有効パラメータ削減／階層ルーティング／モデル再構成

### 研究概要

メモリ容量の小さいエッジ端末では、ニューラルネットワークの計算だけでなく、推論ごとに重みを読み込む転送コストがボトルネックになります。本研究では、学習済みモデルを共有バックボーン、階層ルータ、専門化した複数の葉からなる二分木へ再構成するSigma-Branchを提案します。活性値に基づいて重みを各枝へ割り当て、入力ごとに根から葉までの経路を一つだけ実行します。モデル全体のパラメータを保持したまま、一回の推論で使用する有効パラメータを58～60％削減しました。画像認識と三次元点群認識において精度低下を1.72ポイント以内に抑え、メモリ制約下のエッジAIを効率化します。

![Sigma-Branch Netの階層型単一経路構造](/images/research/ai/sigma-branch-hierarchical-single-path.png)

### 掲載先・出典

- 掲載先：_IEEE Access_, Vol. 14, pp. 126228–126238, 2026
- 論文：K. Tanaka and H. Nishi, “Sigma-Branch: Hierarchical Single-Path Network Reconstruction for Dynamic Inference With Reduced Active Parameters,” _IEEE Access_, Vol. 14, pp. 126228–126238, 2026.
- DOI：[10.1109/ACCESS.2026.3723964](https://doi.org/10.1109/ACCESS.2026.3723964)

---

## Attentionを用いた室内全域の時空間温度推定

### キーワード

室内温度推定／三次元温度分布／時空間モデリング

### 研究概要

快適性と省エネルギーを両立する空調制御には、人が滞在する位置を含む室内全体の温度把握が必要ですが、固定センサや数値流体解析には空間精度や計算負荷の課題があります。本研究では、位置符号化とAttention機構を全結合ニューラルネットワークに組み込んだAST-Modelを提案します。136個のセンサから2秒間隔で収集した温度、時刻、三次元座標を用い、過去10分間の変化から未計測地点を含む温度分布を推定します。平均絶対誤差0.15℃を達成し、少数センサや限られた学習データでも精度を維持しました。エッジ端末上では1サンプル約3.17ミリ秒で推論でき、リアルタイム空調制御への応用が期待されます。

![AST-Modelの最終的なモデル構造](/images/research/ai/ast-model-final-structure.png)

### 掲載先・出典

- 掲載先：_IEEJ Transactions on Electrical and Electronic Engineering_, 2026
- 論文：G. Terumichi, J. Li, T. Kimura, and H. Nishi, “Attention-Based Spatial-Temporal Model for the Entire Indoor Space Temperature Estimation,” _IEEJ Transactions on Electrical and Electronic Engineering_, 2026.
- DOI：[10.1002/tee.70405](https://doi.org/10.1002/tee.70405)

---

## 言語モデルを柔軟に活用した自由記述診療記録の二段階匿名化

### キーワード

電子医療記録（EHR）／医療情報匿名化／自然言語処理（NLP）

### 研究概要

自由記述の電子医療記録には患者を特定し得る機微情報が含まれ、データの有用性を保ちながらプライバシーを守る必要があります。本研究では、①BERT系モデルまたは大規模言語モデルによる氏名・年齢・住所などの検出、②数値・カテゴリ属性の階層関係を考慮したk-匿名化、という二段階の匿名化フレームワークを提案します。機微情報検出ではLLMが95％超、BERT系モデルも約90％のF1値を達成し、匿名化では規則ベース手法が情報損失を抑えました。LoRAによる軽量な追加学習とローカル実行にも対応し、利用環境に応じて精度・プライバシー・計算資源のバランスを選択できます。

![提案する二段階匿名化フレームワークの概要](/images/research/ai/two-stage-anonymization-framework.png)

### 掲載先・出典

- 掲載先：_Computers in Biology and Medicine_, Vol. 195, Article 110624, 2025
- 論文：J. Jia and H. Nishi, “A Flexible Two-Stage Anonymization Framework for Narrative Medical Records Adapting to Various Language Models,” _Computers in Biology and Medicine_, Vol. 195, Article 110624, 2025.
- DOI：[10.1016/j.compbiomed.2025.110624](https://doi.org/10.1016/j.compbiomed.2025.110624)

---

## クライアント間データ移行による異種分散深層学習の高速・高精度化

### キーワード

分散深層学習／連合学習／クライアント間データ移行

### 研究概要

性能の異なる端末が協調する分散学習では、処理の遅い端末（ストラグラー）が同期を待たせます。従来法で遅い端末を除外すると、その端末が持つ固有で有用なデータも失われます。本研究では、データ共有が許可された信頼領域を対象に、ストラグラーから高速端末へデータを動的に移行します。損失勾配と損失の急増から学習難易度指標（LDI）を算出し、学習への寄与が大きいバッチを優先して移します。FEMNISTの評価では、FedAvgの44.99％の時間で学習を完了し、平均精度も1.23ポイント向上しました。負荷が変動する環境でも約3.2倍高速化し、有用なデータを捨てずに学習効率を改善します。

![実験構成とデータ移行可能なクライアント群の概要](/images/research/ai/experimental-setup-data-migration-clients.png)

### 発表先・出典

- 発表先：The 2026 International Symposium on Industrial Electronics（ISIE 2026）
- 論文：Y. Chikaoka, Y. Okuda, and H. Nishi, “Client-to-Client Data Migration for Efficient Heterogeneous Distributed Deep Learning,” _The 2026 International Symposium on Industrial Electronics (ISIE 2026)_, 2026.
