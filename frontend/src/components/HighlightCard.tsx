import { Lock, Send } from "lucide-react";
import { Letter, calculateProgress, formatDate } from "@/lib/letters";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

interface HighlightCardProps {
  letter: Letter;
}

const HighlightCard = ({ letter }: HighlightCardProps) => {
  const navigate = useNavigate();
  const progress = calculateProgress(letter.sentDate, letter.deliveryDate);
  const percent = Math.round(progress * 100);

  return (
    <motion.div
      onClick={() => navigate(`/letter/${letter.id}`)}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
      className="rounded-lg p-5 relative overflow-hidden"
      style={{
        background: "linear-gradient(135deg, hsl(27, 68%, 53%), hsl(20, 60%, 48%))",
      }}
    >
      <div className="flex justify-between items-start mb-2">
        <span className="text-sm text-primary-foreground/70">
          Sent {formatDate(letter.sentDate)}
        </span>
        {letter.isLocked && (
          <Lock size={16} className="text-primary-foreground/60" />
        )}
      </div>

      <h3 className="text-xl font-semibold text-primary-foreground mb-3">
        {letter.title}
      </h3>

      <div className="inline-flex items-center gap-2 bg-primary-foreground/20 backdrop-blur-sm rounded-full px-3 py-1.5 mb-3">
        <Send size={12} className="text-primary-foreground" />
        <span className="text-sm text-primary-foreground">
          Opens {formatDate(letter.deliveryDate)}
        </span>
      </div>

      <div className="mt-2">
        <div className="w-full h-1 bg-primary-foreground/30 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${percent}%` }}
            transition={{ duration: 1, delay: 0.3 }}
            className="h-full bg-primary-foreground rounded-full"
          />
        </div>
        <div className="flex justify-between items-center mt-2">
          <span className="text-xs text-primary-foreground/60">Sent</span>
          <span className="text-xs text-primary-foreground/80">
            {percent}% of the way there
          </span>
        </div>
      </div>
    </motion.div>
  );
};

export default HighlightCard;
