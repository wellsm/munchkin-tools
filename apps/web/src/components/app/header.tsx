import { ArrowLeft, Home } from "lucide-react";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { useT } from "@/lib/i18n/store";

type Props = {
  title: string;
  onBack?: () => void;
  onHome?: () => void;
  right?: ReactNode;
};

export function Header({ title, onBack, onHome, right }: Props) {
  const t = useT();

  return (
    <div className="flex border-b px-4 py-3 items-center justify-between">
      {onBack ? (
        <Button
          variant="ghost"
          size="icon"
          aria-label={t.common.back}
          onClick={onBack}
        >
          <ArrowLeft className="size-6" />
        </Button>
      ) : onHome ? (
        <Button
          variant="ghost"
          size="icon"
          aria-label={t.common.home}
          onClick={onHome}
        >
          <Home className="size-6" />
        </Button>
      ) : (
        <div className="size-11" aria-hidden />
      )}
      <h2 className="text-4xl font-munchkin">{title}</h2>
      {right ?? <div className="size-11" aria-hidden />}
    </div>
  );
}
