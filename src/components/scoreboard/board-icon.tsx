import {
  ChartNoAxesColumn,
  Goal,
  CircleDot,
  Volleyball,
  Trophy,
  Medal,
  GraduationCap,
  BookOpen,
  UsersRound,
  Gamepad2,
  Flag,
  Timer,
} from "lucide-react";
import { type BoardIconId, isBoardIcon } from "@/lib/board-icons";
const icons = {
  scoreboard: ChartNoAxesColumn,
  football: Goal,
  ball: CircleDot,
  volleyball: Volleyball,
  trophy: Trophy,
  medal: Medal,
  school: GraduationCap,
  book: BookOpen,
  teams: UsersRound,
  game: Gamepad2,
  flag: Flag,
  timer: Timer,
};
export function BoardIcon({ id, className = "h-6 w-6" }: { id?: BoardIconId; className?: string }) {
  const Icon = icons[isBoardIcon(id) ? id : "scoreboard"];
  return <Icon aria-hidden="true" strokeWidth={1.8} className={className} />;
}
