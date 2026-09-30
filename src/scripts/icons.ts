// 브라우저 스크립트에서 쓰는 아이콘만 개별 파일로 가져온다(전체 2천여 개를 번들에 싣지 않도록).
import { iconSvg } from '../lib/icon';
import copy from 'lucide-static/icons/copy.svg?raw';
import check from 'lucide-static/icons/check.svg?raw';
import circleCheck from 'lucide-static/icons/circle-check.svg?raw';
import circleAlert from 'lucide-static/icons/circle-alert.svg?raw';
import link from 'lucide-static/icons/link.svg?raw';
import bookmarkCheck from 'lucide-static/icons/bookmark-check.svg?raw';
import bookmarkMinus from 'lucide-static/icons/bookmark-minus.svg?raw';
import trophy from 'lucide-static/icons/trophy.svg?raw';
import fileText from 'lucide-static/icons/file-text.svg?raw';
import arrowUp from 'lucide-static/icons/arrow-up.svg?raw';
import arrowDown from 'lucide-static/icons/arrow-down.svg?raw';
import chevronsUpDown from 'lucide-static/icons/chevrons-up-down.svg?raw';

const RAW = { copy, check, 'circle-check': circleCheck, 'circle-alert': circleAlert, link, 'bookmark-check': bookmarkCheck, 'bookmark-minus': bookmarkMinus, trophy, 'file-text': fileText, 'arrow-up': arrowUp, 'arrow-down': arrowDown, 'chevrons-up-down': chevronsUpDown };
export type IconName = keyof typeof RAW;

export const icon = (name: IconName, size = 18) => iconSvg(RAW[name], { size });
