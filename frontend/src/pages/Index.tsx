import { Plus, Mail } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import LetterCard from "@/components/LetterCard";
import BottomNav from "@/components/BottomNav";
import Spinner from "@/components/ui/spinner";
import { getSentLetters } from "@/lib/letters";
import { useState, useEffect } from "react";

const SentPage = () => {
  const navigate = useNavigate();
  const [letters, setLetters] = useState<Awaited<ReturnType<typeof getSentLetters>>>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadLetters = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getSentLetters();
      console.log('Loaded sent letters:', data);
      setLetters(data);
    } catch (error) {
      console.error('Error loading sent letters:', error);
      setError(error instanceof Error ? error.message : 'Failed to load letters');
      setLetters([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadLetters();
  }, []);

  return (
    <div className="h-[100dvh] bg-background overflow-hidden">
      <div className="fixed top-0 left-0 right-0 z-40 bg-background">
        <div className="max-w-5xl mx-auto px-5 pt-6 pb-4">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between"
          >
            <h1 className="md:text-[34px] text-[24px] font-bold text-foreground">Sent</h1>
            <button
              onClick={() => navigate("/create")}
              className="w-12 h-12 rounded-full bg-primary flex items-center justify-center shadow-lg shadow-primary/30 active:scale-95 transition-transform"
            >
              <Plus size={22} className="text-primary-foreground" />
            </button>
          </motion.div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-5 h-full pt-24">
        <div className="h-full overflow-y-auto pb-28 hide-mobile-scrollbar">
          {isLoading ? (
            <div className="flex items-center justify-center min-h-full">
              <Spinner size="lg" />
            </div>
          ) : error ? (
            <div className="flex items-center justify-center min-h-full text-muted-foreground">
              <div className="text-center">
                <Mail size={64} className="opacity-20 mx-auto mb-4" />
                <p className="text-sm text-destructive">{error}</p>
                <button
                  onClick={loadLetters}
                  className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm"
                >
                  Retry
                </button>
              </div>
            </div>
          ) : letters.length === 0 ? (
            <div className="flex items-center justify-center min-h-full text-muted-foreground">
              <Mail size={64} className="opacity-20" />
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {letters.map((letter, i) => (
                <LetterCard
                  key={letter.id}
                  letter={letter}
                  index={i}
                  onDelete={loadLetters}
                />
              ))}
            </div>
          )}
        </div>
      </div>
      <BottomNav />
    </div>
  );
};

export default SentPage;
