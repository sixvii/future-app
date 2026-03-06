import { Timer, Trash2 } from "lucide-react";
import { Letter, formatDate, getCountdownText, isDelivered, deleteLetter } from "@/lib/letters";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { toast } from "@/hooks/use-toast";

interface LetterCardProps {
  letter: Letter;
  index: number;
  onDelete?: () => void;
}

const LetterCard = ({ letter, index, onDelete }: LetterCardProps) => {
  const navigate = useNavigate();
  const [swiped, setSwiped] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [x, setX] = useState(0);

  const handleDragEnd = (_event: any, info: any) => {
    if (info.offset.x < -50) {
      setSwiped(true);
    } else {
      setSwiped(false);
      setX(0);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteLetter(letter.id);
      toast({
        title: "Letter deleted",
        description: '"' + letter.title + '" has been deleted.',
      });
      onDelete?.();
    } catch (error) {
      toast({
        title: "Could not delete letter",
        description: error instanceof Error ? error.message : "Try again",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="relative overflow-hidden rounded-lg">
      {/* Delete background */}
      {swiped && (
        <div className="absolute inset-0 bg-destructive rounded-lg flex items-center justify-end pr-4">
          <Trash2 size={20} className="text-destructive-foreground" />
        </div>
      )}

      <motion.div
        drag="x"
        dragConstraints={{ left: -100, right: 0 }}
        dragElastic={0.1}
        dragMomentum={false}
        onDragEnd={handleDragEnd}
        animate={{ x: swiped ? -80 : 0, opacity: 1, y: 0 }}
        onClick={() => !swiped && navigate(`/letter/${letter.id}`)}
        initial={{ opacity: 0, y: 15 }}
        transition={{ 
          opacity: { delay: 0.1 * index, duration: 0.35 },
          y: { delay: 0.1 * index, duration: 0.35 },
          x: { type: "spring", stiffness: 300, damping: 30 }
        }}
        className="flex items-stretch gap-3 bg-card rounded-lg overflow-hidden active:scale-[0.98] transition-transform cursor-pointer"
      >
        <div className="w-1 bg-primary rounded-l-lg shrink-0" />
        <div className="flex-1 py-4 pr-4">
          <span className="text-xs text-muted-foreground">
            Sent {formatDate(letter.sentDate)}
          </span>
          <h4 className="text-[15px] font-medium text-foreground mt-1">
            {letter.title}
          </h4>
          <span
            className={`text-sm mt-1 inline-block ${
              letter.status === "delivered" || isDelivered(letter.deliveryDate)
                ? "text-green-600 dark:text-green-400"
                : "text-primary"
            }`}
          >
            {letter.status === "delivered" || isDelivered(letter.deliveryDate)
              ? "✓ Delivered"
              : getCountdownText(letter.deliveryDate)}
          </span>
        </div>
        <div className="flex items-center pr-4">
          {letter.status === "delivered" || isDelivered(letter.deliveryDate) ? (
            <span className="text-xs text-green-600 dark:text-green-400 font-medium">✓</span>
          ) : (
            <Timer size={18} className="text-primary" />
          )}
        </div>
      </motion.div>

      {/* Delete button */}
      {swiped && (
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={handleDelete}
          disabled={isDeleting}
          className="absolute right-0 top-0 bottom-0 w-20 bg-destructive text-destructive-foreground flex items-center justify-center disabled:opacity-50"
        >
          {isDeleting ? "..." : <Trash2 size={20} />}
        </motion.button>
      )}
    </div>
  );
};

export default LetterCard;
