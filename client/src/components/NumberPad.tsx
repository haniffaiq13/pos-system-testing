// NumberPad Component - 3x4 grid numeric input for POS

import { Button } from "@/components/ui/button";
import { Delete, X } from "lucide-react";

interface NumberPadProps {
  value: string;
  onChange: (value: string) => void;
  maxLength?: number;
}

export function NumberPad({ value, onChange, maxLength = 10 }: NumberPadProps) {
  const handleNumber = (num: string) => {
    if (value.length < maxLength) {
      onChange(value + num);
    }
  };

  const handleBackspace = () => {
    onChange(value.slice(0, -1));
  };

  const handleClear = () => {
    onChange('');
  };

  const buttons = [
    '1', '2', '3',
    '4', '5', '6',
    '7', '8', '9',
    'clear', '0', 'back',
  ];

  return (
    <div className="grid grid-cols-3 gap-4" data-testid="number-pad">
      {buttons.map((btn) => {
        if (btn === 'clear') {
          return (
            <Button
              key={btn}
              variant="outline"
              size="lg"
              onClick={handleClear}
              className="min-h-16 text-xl font-semibold rounded-2xl"
              data-testid="button-clear"
            >
              <X className="w-5 h-5" />
            </Button>
          );
        }
        
        if (btn === 'back') {
          return (
            <Button
              key={btn}
              variant="outline"
              size="lg"
              onClick={handleBackspace}
              className="min-h-16 text-xl font-semibold rounded-2xl"
              data-testid="button-backspace"
            >
              <Delete className="w-5 h-5" />
            </Button>
          );
        }

        return (
          <Button
            key={btn}
            variant="outline"
            size="lg"
            onClick={() => handleNumber(btn)}
            className="min-h-16 text-2xl font-semibold rounded-2xl"
            data-testid={`button-number-${btn}`}
          >
            {btn}
          </Button>
        );
      })}
    </div>
  );
}
