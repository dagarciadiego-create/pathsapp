import { Mail, Phone, Users, Handshake, Megaphone, Dot } from "lucide-react";
import type { ActionType } from "@/lib/constants";

const icons: Record<ActionType, typeof Mail> = {
  LETTER: Mail,
  CALL: Phone,
  MEETING: Users,
  ENCOUNTER: Handshake,
  CAMPAIGN: Megaphone,
  OTHER: Dot,
};

export function ActionTypeIcon({
  type,
  className,
}: {
  type: ActionType;
  className?: string;
}) {
  const Icon = icons[type] ?? Dot;
  return <Icon className={className ?? "h-4 w-4"} aria-hidden />;
}
