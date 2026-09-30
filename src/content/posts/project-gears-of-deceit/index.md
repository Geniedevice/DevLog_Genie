---
title: "Gears of Deceit — 달리는 열차 위, 5인 소셜 디덕션"
description: 달리는 증기기관차 위에서 벌어지는 10분간의 심리전. 세션·근접 보이스·열차 주행·툰 셰이딩을 맡으며 "들리는 범위도 규칙이다"를 배운 기록입니다.
date: 2026-09-30T20:20:00+09:00
cover: ./cover.jpg
coverAlt: Gears of Deceit 타이틀 아트 — 설원을 달리는 증기기관차
category: Project
tags: [Unreal, 멀티플레이, Steam OSS, VOIP, 팀 프로젝트]
series: 게임 프로젝트
game:
  title: Gears of Deceit
  tagline: 달리는 증기기관차 위, 5인 멀티플레이 소셜 디덕션
  genre: 3D 소셜 디덕션 파티 액션 · 5인 멀티플레이
  period: 2026.06 – 2026.07
  team: 5
  role: 네트워크 · 열차 시스템 · 렌더링 / UI
  engine: Unreal Engine 5
  stack: [C++, GAS, Steam OSS, VOIP]
  order: 3
  portfolio: https://geniedevice.github.io/Game-Project-Technical-Introduction/projects/gears-of-deceit/
  repo: https://github.com/NBcampUnrealTrack/8th-Team4-CH4-Project
  video: https://www.youtube.com/watch?v=d1UV0k-tygk
---

달리는 증기기관차 위에서 다섯 명이 벌이는 10분간의 심리전입니다. 5인 팀에서 **네트워크 · 보이스 · 열차 시스템 · 렌더링 / UI** 를 맡았습니다.

<iframe class="video" src="https://www.youtube-nocookie.com/embed/d1UV0k-tygk" title="Gears of Deceit 순찰자 시점 플레이" loading="lazy" allowfullscreen></iframe>

## 한눈에

| 항목 | 내용 |
| --- | --- |
| 장르 | 3D 소셜 디덕션 파티 액션 |
| 인원 · 한 판 | 5인 고정 멀티플레이 · 10분 |
| 기간 | 2026.06 – 2026.07 |
| 팀 | 5명 |
| 담당 | 네트워크 · 열차 시스템 · 렌더링 / UI |
| 환경 | Unreal Engine 5 · C++ / Blueprint · PC (Steam) |

> [!NOTE]
> 미니게임 7종, 동물 스킨, 역할별 어빌리티 등은 팀원들이 담당했습니다. 아래는 커밋 이력으로 확인되는 제 작업입니다.

## 풀어야 했던 문제

누가 어디서 무슨 말을 했는지가 승패를 가르는 장르입니다. 세션이 불안정하거나 목소리가 엉뚱한 곳까지 들리면 **게임 자체가 성립하지 않습니다.**

## 이렇게 풀었다

| 영역 | 접근 | 결과 |
| --- | --- | --- |
| 세션 | Steam OSS · AdvancedSessions 로비, BUILD_ID 서명으로 남의 방 차단 | Steam 세션 + 근접 보이스 |
| 보이스 | 거리 감쇠 근접 대화, 비밀방 · 생사 기준 채널 격리 | 들리는 범위가 추리 재료가 됨 |
| 열차 | 스플라인 주행, Movement Base 강제 바인딩으로 탑승 유지 | 무게 연동 속도 · 탈선 방지 |
| 렌더링 | 셀 셰이딩 포스트 프로세스, 뎁스 스텐실 기반 상호작용 표시 | 툰 셰이딩 + 외곽선 |

## 트러블 슈팅

### 세션 목록이 비거나, 남의 방이 섞이거나, 유령 방이 남음

세 증상이 비슷해 보여도 원인이 달랐습니다. 종료 경로를 LoadMainMenu 에 연결하고 검색 워치독 · 가드 리셋을 추가했으며, BUILD_ID 서명 필터로 우리 빌드만 통과시켰습니다. 재참여 · 검색 · 강제 종료 어느 경로에서도 방 목록이 정상으로 돌아옵니다.

> 세 증상이 비슷해 보여도 원인이 다르면 처방도 따로 붙여야 한다.

### 죽은 플레이어의 목소리가 산 사람에게 들림

생사와 공간을 기준으로 채널을 분리하고, 상태가 바뀌는 시점에 채널을 다시 배정했습니다. 관전자가 정보를 흘릴 수 없게 되어 규칙이 다시 성립했습니다.

> [!IMPORTANT]
> 소셜 디덕션에서 들리는 범위는 편의 기능이 아니라 **규칙**이다. 규칙이 새면 게임이 무너진다.

### 움직이는 열차 위에서 캐릭터가 반대로 밀려 떨어짐

`SetBase()` 로 캐릭터의 Base 를 발판에 강제 바인딩해 열차의 이동 벡터를 계속 받도록 했습니다. 주행 중에도 지붕 위 이동 · 전투가 유지됩니다.

> 움직이는 바닥 위에서는 '가만히 있는 것'도 매 프레임 계산해야 하는 상태다.

## 더 보기

- [포트폴리오 상세 — 역할 · 능력 구조, 게임 플로우, 기능별 영상](https://geniedevice.github.io/Game-Project-Technical-Introduction/projects/gears-of-deceit/)
- [GitHub 저장소](https://github.com/NBcampUnrealTrack/8th-Team4-CH4-Project)
- [순찰자 시점 플레이 영상 (YouTube)](https://www.youtube.com/watch?v=d1UV0k-tygk)
