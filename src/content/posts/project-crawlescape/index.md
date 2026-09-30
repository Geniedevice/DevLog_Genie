---
title: "Crawlescape — 무기를 늘려도 무너지지 않는 액션 로그라이크 TPS"
description: 6인 팀으로 4주 동안 만든 액션 로그라이크 TPS. 데이터 드리븐 무기, 총알 오브젝트 풀링, UI 매니저로 "기능을 더할수록 비용이 붙는" 구조를 끊어낸 기록입니다.
date: 2026-09-30T20:10:00+09:00
cover: ./cover.jpg
coverAlt: Crawlescape 타이틀 아트
category: Project
tags: [Unreal, 오브젝트 풀링, DataAsset, 팀 프로젝트]
series: 게임 프로젝트
game:
  title: Crawlescape
  tagline: 다양한 무기로 싸우는 액션 로그라이크 TPS
  genre: 액션 TPS · 로그라이크
  period: 2026.05.01 – 2026.05.27 (4주)
  team: 6
  role: 전투 시스템 · 오브젝트 풀링 · UI 매니저 · 포스트 프로세스
  engine: Unreal Engine 5.5
  stack: [C++, Blueprint, DataAsset, Object Pooling]
  order: 2
  portfolio: https://geniedevice.github.io/Game-Project-Technical-Introduction/projects/crawlescape/
  video: https://www.youtube.com/watch?v=6jrdc7jVilQ
---

다양한 무기로 싸우며 구역을 돌파하는 액션 로그라이크 TPS 입니다. 6인 팀에서 **전투 시스템 · 오브젝트 풀링 · UI 관리 · 포스트 프로세스** 를 맡았습니다.

<iframe class="video" src="https://www.youtube-nocookie.com/embed/6jrdc7jVilQ" title="Crawlescape 플레이 영상" loading="lazy" allowfullscreen></iframe>

## 한눈에

| 항목 | 내용 |
| --- | --- |
| 장르 | 액션 TPS |
| 기간 | 2026.05.01 – 2026.05.27 (4주) |
| 팀 | 6명 |
| 담당 | 전투 시스템 · 오브젝트 풀링 · UI 매니저 · 포스트 프로세스 |
| 환경 | Unreal Engine 5.5 · C++ / Blueprint · PC (Windows) |

## 풀어야 했던 문제

총기가 늘 때마다 클래스를 하나씩 더 만들고, 화면이 늘 때마다 열고 닫는 코드를 여기저기 심는 구조였습니다. 거기에 몬스터를 많이 스폰하면 프레임이 무너졌습니다. **기능을 더할수록 비용이 같이 붙는 것**이 문제였습니다.

## 이렇게 풀었다

| 영역 | 접근 | 결과 |
| --- | --- | --- |
| 무기 | 수치는 DataAsset, 무기별 동작은 BlueprintImplementableEvent 로 열어 템플릿화 | C++ 수정 없이 DataAsset + BP 로 무기 추가 |
| 총알 | 미리 만들어 두고 꺼내 쓰는 오브젝트 풀링 | 총알 · 몬스터 재사용 |
| UI | UIManager 한 곳이 열고 닫기와 중복을 카운팅으로 전담 | 화면 관리 일원화 |
| 연출 | 무기 소켓 · 스프링 암 트레이스, 포스트 프로세스와 UI 머티리얼 | 연출을 게임 코드와 분리 |

전체적으로 **60fps 안정화**까지 끌어올렸습니다.

### 데이터 드리븐 무기와 템플릿 패턴

공통 흐름은 C++ 에 두고, 무기마다 달라지는 부분만 BlueprintImplementableEvent 로 열었습니다. 새 무기는 DataAsset 과 BP 하나로 추가됩니다.

### UI 매니저

레퍼런스 카운터를 기준으로 위젯을 중앙에서 관리했습니다. 여러 곳에서 같은 화면을 열어도 한 번만 뜨고, 모두 닫혀야 사라집니다.

### Dynamic Material Instance 로 UI 효과

연출을 로직이 아니라 머티리얼에서 처리해 게임 코드와 분리했습니다.

## 트러블 슈팅

### 총알을 SpawnActor 로 만들 때 프레임이 떨어지는 문제

풀링 컴포넌트를 붙여 총알을 미리 만들어 두고, 발사할 때는 꺼내 위치와 방향만 다시 세팅하도록 바꿨습니다. 명중하거나 수명이 끝나면 Destroy 대신 비활성화해 풀로 돌려보냅니다.

### 패키징하면 일부 UASSET 이 빠지는 문제

직접 참조가 없는 에셋이 쿠킹에서 빠지고 있었습니다. 프로젝트 세팅의 **Additional Asset Directories to Cook** 에 경로를 등록해 참조가 없어도 포함되게 했고, 패키징이 정상적으로 완료됐습니다.

## 더 보기

- [포트폴리오 상세 — 워크플로우 · 게임 플로우 · 기능별 영상](https://geniedevice.github.io/Game-Project-Technical-Introduction/projects/crawlescape/)
- [플레이 영상 (YouTube)](https://www.youtube.com/watch?v=6jrdc7jVilQ)
