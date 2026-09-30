---
title: 글쓰기 가이드 — 이 블로그에서 쓸 수 있는 마크다운
description: 콜아웃, 코드 블록, 표, 접기 등 이 블로그가 지원하는 서식을 한 번에 확인하는 견본 글입니다.
date: 2026-09-29
cover: ./cover.png
coverAlt: 마법진 위에 펼쳐진 마도서와 깃펜
category: Devlog
tags: [guide, markdown]
draft: true
---

이 글은 `draft: true` 라서 **로컬(`npm run dev`)에서만 보이고 배포 사이트에는 올라가지 않습니다.** 새 글을 쓸 때 서식 견본으로 쓰세요.

## 프런트매터

```yaml
---
title: 글 제목
description: 카드와 검색 결과에 나오는 한두 문장 요약
date: 2026-09-30
updated: 2026-10-02   # 선택: 수정일
category: Unreal      # 카드 색·아이콘이 카테고리별로 정해진다
tags: [GAS, 트러블슈팅]
series: GAS 탐구      # 선택: 같은 시리즈끼리 묶여 목차가 붙는다
pinned: false         # 선택: 홈 맨 앞에 고정
draft: false          # true 면 배포에서 빠진다
---
```

## 콜아웃

> [!NOTE]
> 참고할 만한 배경 정보.

> [!TIP]
> 알아 두면 편한 요령.

> [!IMPORTANT]
> 꼭 알아야 하는 핵심.

> [!WARNING]
> 밟기 쉬운 함정. 예: 타이머를 `EndPlay` 에서 정리하지 않으면 파괴 후 발동한다.

> [!CAUTION]
> 데이터 손실이나 크래시로 이어지는 위험.

## 코드 블록

```cpp
void AMyActor::EndPlay(const EEndPlayReason::Type Reason)
{
    // 파괴 뒤에 발동하면 댕글링 this 로 크래시
    GetWorldTimerManager().ClearAllTimersForObject(this);
    Super::EndPlay(Reason);
}
```

```csharp
public sealed class Health : MonoBehaviour
{
    [SerializeField] private int max = 100;
}
```

인라인 코드는 `UAbilitySystemComponent` 처럼 씁니다.

### 표

| 방식 | 장점 | 단점 |
| --- | --- | --- |
| 동기 로드 | 단순함 | 게임 중 프레임 드랍 |
| 비동기 로드 | 끊김 없음 | 콜백 흐름 관리 |
| 프리로드 | 필요 시 즉시 사용 | 메모리 상주 |

### 접기

<details>
<summary>긴 로그 보기</summary>

```text
LogOutputDevice: Error: Ensure condition failed: IsValid(Target)
```

</details>

## 이미지

글 폴더에 넣고 `![설명](./파일.png)` 로 참조합니다. 바로 아랫줄에 `*캡션*` 을 쓰면 캡션이 됩니다.
