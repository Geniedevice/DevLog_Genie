---
title: "EmberRoad — 모닥불에 둘러앉은 마피아 카드 게임"
description: 보드게임 《뱅!》에 확률 판정을 얹은 4~7인 마피아 카드 게임. 카드 연출 · 시퀀스 · 렌더링을 맡으며 "같은 사실은 한 곳에만 적는다"를 배운 기록입니다.
date: 2026-10-13T21:00:00+09:00
cover: ./cover.jpg
coverAlt: EmberRoad 타이틀 화면 — 노을 진 성과 모닥불
category: Project
tags: [Unreal, 카드 연출, 머티리얼, 시퀀스, Chaos Destruction, 팀 프로젝트]
series: 게임 프로젝트
game:
  title: EmberRoad
  tagline: 모닥불에 둘러앉은 4~7인, 확률 판정 카드로 싸우는 마피아 게임
  genre: TRPG 스타일 마피아 카드 게임 · PvP 4~7인 / PvE
  period: 2026.07 – 2026.10
  team: 9
  role: 카드 연출 · 시퀀스 · 렌더링 / 라이팅
  engine: Unreal Engine 5.8
  stack: [C++, GAS, CommonUI, Chaos Destruction]
  order: 4
  portfolio: https://geniedevice.github.io/Game-Project-Technical-Introduction/projects/emberroad/
---

보드게임 《뱅!》의 정체 은닉과 카드 전투에, 모든 카드가 **대실패 · 실패 · 성공 · 대성공** 으로 갈리는 확률 판정을 얹은 마피아 게임입니다. 9인 팀에서 **카드 연출 · 시퀀스 · 렌더링 / 라이팅** 을 맡았습니다.

<video class="video" src="https://geniedevice.github.io/Game-Project-Technical-Introduction/projects/emberroad/card-play.mp4" poster="https://geniedevice.github.io/Game-Project-Technical-Introduction/projects/emberroad/card-play.jpg" controls playsinline preload="none"></video>

## 한눈에

| 항목 | 내용 |
| --- | --- |
| 장르 | TRPG 스타일 마피아 카드 게임 |
| 인원 | PvP 4~7인 · PvE 싱글 |
| 기반 | 보드게임 《뱅!》 + 확률 판정 |
| 기간 | 2026.07 – 2026.10 |
| 팀 | 9명 |
| 담당 | 카드 연출 · 시퀀스 · 렌더링 / 라이팅 |
| 환경 | Unreal Engine 5.8 · C++ / Blueprint · PC (Steam) |

> [!NOTE]
> 규칙 · 판정 서버 로직, PvE AI, 사운드, 캐릭터 애니메이션, HUD 대부분은 팀원들이 담당했습니다. 아래는 커밋 이력으로 확인되는 제 작업입니다.

## 풀어야 했던 문제

카드가 11종이고 판정이 4단계라, 연출을 카드마다 만들면 **11 × 4 = 44가지** 를 손으로 그려야 했습니다. 거기에 멀티플레이라 인트로 · 엔딩 연출이 클라마다 어긋나면 **같은 판을 다르게 보게 됩니다.**

## 이렇게 풀었다

| 영역 | 접근 | 결과 |
| --- | --- | --- |
| 카드 연출 | 카드 효과 목록을 그대로 연출 프리미티브 조합으로 재사용 | 카드별 연출 에셋 없음 |
| 카드 위젯 | Input · Motion · FX 모듈로 나눈 상태 기계 | 등장 → 호버 → 사용 → 퇴장 |
| 머티리얼 | 위젯 애니메이션이 0~1 값 하나로 글로우 · 디졸브를 구동 | 커브를 보며 바로 튜닝 |
| 시퀀스 | 서버 GameState 가 단계를 복제, 영상은 각자 로컬 재생 | 늦게 들어와도 같은 단계 |
| 엔딩 | Chaos Destruction 시뮬레이션을 캐시로 구워 재생 | 진영별 엔딩 3종 |
| 라이팅 | 실사 전제 설정을 걷어내고 노을 3레이어 | 로우폴리 톤 고정 |

### 카드 연출 — 효과 목록이 곧 연출 조합

| 방식 | 분기 | 문제 |
| --- | --- | --- |
| 카드 ID로 Switch | 카드 수만큼 | 추가마다 그래프 수정, 빠뜨리면 조용히 연출 없음 |
| 대표 성격 하나로 Switch | 7개 | 속공(뽑기 + 피해 + 회복)이 피해 하나로 뭉개짐 |
| **효과 목록을 순서대로 재생** | 프리미티브 수만큼 고정 | 새 카드는 효과만 적으면 연출이 따라옴 |

> [!IMPORTANT]
> 연출 전용 데이터 테이블은 만들지 않았다. 같은 사실이 두 곳에 적히면, 카드에서 피해를 뺐는데 공격 연출이 계속 나가는 식으로 **반드시 어긋난다.**

<video class="video" src="https://geniedevice.github.io/Game-Project-Technical-Introduction/projects/emberroad/card-hover.mp4" poster="https://geniedevice.github.io/Game-Project-Technical-Introduction/projects/emberroad/card-hover.jpg" controls playsinline preload="none"></video>

### 머티리얼 — 판정 글로우와 퇴장 디졸브

글로우를 **C++ → BP Tick → 위젯 애니메이션** 순으로 세 번 옮겼습니다. 기준은 언어가 아니라 *만드는 사람이 눈으로 보면서 다듬을 수 있는가* 였습니다.

| 안 | 값을 고치는 법 | 판단 |
| --- | --- | --- |
| C++ 이 파라미터 직접 구동 | 코드 수정 → 빌드 | BP에서 손댈 수 없음 |
| BP Event Tick + 수식 | 숫자 수정 → PIE → 0.45초 관찰 | 재생 전엔 볼 수 없음 |
| **위젯 애니메이션 + 머티리얼** | 커브를 보며 바로 수정 | 채택 |

<video class="video" src="https://geniedevice.github.io/Game-Project-Technical-Introduction/projects/emberroad/dissolve-attack.mp4" poster="https://geniedevice.github.io/Game-Project-Technical-Introduction/projects/emberroad/dissolve-attack.jpg" controls playsinline preload="none"></video>

### 시퀀스 — 서버가 단계를 들고 있다

| 고민 | 선택 |
| --- | --- |
| 이벤트로 쏠까, 상태로 둘까 | 상태 — 늦게 와도 지금 단계를 받는다 |
| 타이머는 누가 | 서버에 하나 — 클라가 각자 세면 어긋난다 |
| 영상을 복제할까 | 단계만 복제, 영상은 각자 로컬 재생 |
| 시퀀스 목록은 어디에 | 맵의 액터 — 그 맵의 성을 찍은 것이라 맵에 속한다 |

### 엔딩 — 진영별 세 가지

| 진영 | 엔딩 |
| --- | --- |
| 보안관 | 지켜낸 새벽 — 성에 아침이 온다 |
| 무법자 | 무너진 왕국 — 성이 붕괴한다 (Chaos Destruction) |
| 배신자 | 빼앗긴 왕좌 — 주인이 바뀐다 |

<video class="video" src="https://geniedevice.github.io/Game-Project-Technical-Introduction/projects/emberroad/ending-collapse.mp4" poster="https://geniedevice.github.io/Game-Project-Technical-Introduction/projects/emberroad/ending-collapse.jpg" controls playsinline preload="none"></video>

## 트러블 슈팅

### 로우폴리 씬이 실사처럼 보이고 외곽선이 안 나옴

포스트 프로세스 값부터 만지려다, 원인이 파이프라인에 있으면 포스트로는 못 덮는다고 보고 렌더링 설정을 먼저 열었습니다. 고정 카메라 단일 씬에 Lumen · 하드웨어 레이트레이싱 · Substrate · Nanite 가 켜져 있었고, AA는 꺼져 있었으며, `r.CustomDepth=1` 이라 외곽선이 읽을 스텐실 버퍼 자체가 없었습니다. Lumen 을 끄고 AA는 TSR, `r.CustomDepth` 는 3 으로 바꿔 실루엣과 외곽선을 되찾았습니다.

> 코드는 멀쩡한데 렌더링 쪽이 0%였다. 스타일라이즈드에서 Lumen 을 끄는 건 품질을 낮추는 게 아니라, 의도한 빛을 고르는 일이다.

### 바닥 · 길 · 잡초가 미세하게 깜빡임

처음엔 메시 겹침(Z-Fighting)만 의심했지만, 정리한 뒤에도 깜빡임이 남았습니다. 표면 겹침 · 작은 식생의 그림자와 거리장 AO · 보조 광원의 반사 하이라이트로 **원인이 셋** 이었고, 하나씩 끄며 비교해 각각 처방했습니다.

> 증상 하나에 원인이 여럿일 수 있다. 나눠서 하나씩 끄는 것이 가장 빠르다.

### 연출 단계가 클라마다 어긋남

클라마다 도는 타이머와 일회성 멀티캐스트로는 늦게 들어온 사람이 뒤처지고, 히치로 콜백이 밀린 클라는 다른 화면에 갇혔습니다. 타이머를 서버에 하나만 두고 단계를 GameState 의 복제 변수로 바꿨고, 리슨 서버 호스트는 OnRep 이 불리지 않으므로 서버에서 직접 통지하게 했습니다.

> 피할 것은 타이머가 아니라 **클라마다 도는 타이머** 다.

## 더 보기

- [포트폴리오 상세 — 카드 생애 · 인트로 흐름도, 기능별 영상](https://geniedevice.github.io/Game-Project-Technical-Introduction/projects/emberroad/)
- 개발 기록: [Primitive 조합 연출](https://blog.naver.com/startblack7/224369187359) · [카드 연출(DMI)](https://blog.naver.com/startblack7/224370473451) · [로우폴리 라이팅](https://blog.naver.com/startblack7/224391284637) · [배경 깜빡임](https://blog.naver.com/startblack7/224416393147) · [붕괴 시뮬레이션](https://blog.naver.com/startblack7/224426329189) · [인트로/엔딩 시퀀스](https://blog.naver.com/startblack7/224433425791) · [카드 연출 모듈화](https://blog.naver.com/startblack7/224434348874)
