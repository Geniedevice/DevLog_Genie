---
title: "DESTINATION — 혼자 만든 멀티플레이 좀비 웨이브 슈터"
description: 폐허 도시에서 좀비 웨이브를 함께 버티는 3D 멀티플레이 슈터. 네트워크부터 전투·아이템·AI까지 혼자 설계하며 세운 구조의 기준을 정리합니다.
date: 2026-09-30T20:00:00+09:00
cover: ./cover.jpg
coverAlt: DESTINATION 배너 아트
category: Project
tags: [Unreal, GAS, 멀티플레이, 개인 프로젝트]
series: 게임 프로젝트
game:
  title: DESTINATION
  tagline: 대규모 PVE와 총기 액션이 결합된 빠른 템포의 서바이벌 게임
  genre: 3D 좀비 로그라이크 액션 · 멀티플레이 협동
  period: "2025.10"
  team: 1
  role: 전체 설계 및 구현
  engine: Unreal Engine 5
  stack: [C++, GAS, Steam OSS, Replication]
  order: 1
  portfolio: https://geniedevice.github.io/Game-Project-Technical-Introduction/projects/destination/
  repo: https://github.com/Geniedevice/DESTINATION-OnlineSubSystem
---

폐허가 된 도시에서 몰려오는 좀비 웨이브를 함께 버티는 3D 멀티플레이 슈터입니다. 스팀으로 방을 만들고 친구가 들어와, 웨이브를 넘길 때마다 능력 카드를 골라 캐릭터를 키워 나갑니다.

혼자 만든 프로젝트라 네트워크부터 전투 · 아이템 · AI · UI까지 전부 직접 설계했습니다. 기능을 늘리는 것보다 **나중에 하나를 바꿔도 나머지가 안 깨지는 구조**를 잡는 데 시간을 더 썼습니다.

## 한눈에

| 항목 | 내용 |
| --- | --- |
| 장르 | 3D 좀비 로그라이크 액션 · 멀티플레이 협동 |
| 기간 | 2025.10 |
| 팀 | 1명 (개인 프로젝트) |
| 담당 | 네트워크 · 전투 · 아이템 · AI · UI 전 영역 |
| 환경 | Unreal Engine 5 · C++ / Blueprint · PC (Steam) |

## 풀어야 했던 문제

슈터의 시스템은 서로 얽혀 있습니다. 무기가 늘면 데미지 계산이 흔들리고, 아이템이 늘면 네트워크가 무거워지고, 적이 늘면 프레임이 무너집니다.

## 이렇게 풀었다

| 영역 | 접근 | 결과 |
| --- | --- | --- |
| 전투 | 모든 피해를 **ExecCalc** 한 곳으로 모아 계산 경로를 단일화 | 데미지 경로 단일화 |
| 아이템 | **FastArraySerializer** 로 바뀐 항목만 델타 복제 | 아이템 동기화 부담 감소 |
| AI | 컨트롤러를 미리 만들어 빌려 쓰는 **풀링** | 스폰 비용 제거 |
| 데이터 | 무기 · 아이템 · 카드 수치를 DataAsset / DataTable 로 분리 | 코드 수정 없이 수치 조정 |

### 네트워크 — Steam OSS 세션과 서버 권위 구조

> 멀티플레이 게임은 전투가 아무리 좋아도 방에 못 들어가면 아무것도 아닙니다.

Steam OSS 로 세션 · 로비를 구성하고, 게임 규칙은 서버 권위 게임 모드가 쥐게 했습니다.

### 전투 — ExecCalc 단일 데미지 파이프라인

무기가 늘어도 "맞으면 얼마가 깎이는지"는 한 곳에서만 결정되게 했습니다. AttributeSet 과 무기별 어빌리티는 GAS 로 나누고, 최종 계산만 ExecCalc 로 모았습니다.

### 최적화 · 성장 — AI 컨트롤러 풀링과 능력 카드

> 웨이브 게임의 재미는 점점 많아지는 것인데, 구현에서는 그게 그대로 비용입니다.

웨이브 스포너가 컨트롤러를 풀에서 빌려 쓰고, 웨이브를 넘길 때마다 로그라이크 능력 카드로 성장합니다.

## 회고 — 혼자 만드는 구조는 어디까지 가야 할까

기능을 하나 붙일 때마다 앞서 만든 것이 흔들렸습니다. 에픽의 **Lyra** 를 분석해 가져온 것은 **InputTag** 였습니다. 키를 어빌리티에 바로 묶지 않고 이름표를 사이에 두니, 무기가 늘어도 손댈 곳이 데이터 한 줄로 줄었습니다.

| 구분 | 내용 |
| --- | --- |
| 가져온 것 | Lyra 의 InputTag — `키 → InputTag → ASC → GA`, 무기 추가가 데이터 한 줄로 |
| 넓힌 것 | ItemTag 로 DataTable 선택, SlotTag 로 장착 위치 결정 |
| 포기한 것 | Experience · GameFeature — 감당할 수 있는 범위를 넘음 |
| 시행착오 | 쓸 수 있는 곳마다 태그를 붙였다가 이름 체계를 두 번 갈아엎음 |
| 남은 숙제 | 스포너 체력을 GAS 피해 체계 밖에 둬서 피해 경로가 두 갈래로 갈라짐 |

> [!TIP]
> 시행착오 끝에 남은 것은 기능이 아니라 **기준**이었습니다. 큰 프로젝트를 그대로 흉내 내는 대신 감당할 수 있는 만큼만 가져온다.

## 더 보기

- [포트폴리오 상세 — 코드 플로우 · 게임 플로우 · 플레이 영상](https://geniedevice.github.io/Game-Project-Technical-Introduction/projects/destination/)
- [GitHub 저장소](https://github.com/Geniedevice/DESTINATION-OnlineSubSystem)
- [개발 기록 (블로그)](https://blog.naver.com/startblack7/224034428520)
