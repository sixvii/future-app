import { Send, Mail, Settings } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { getUnreadCount } from "@/lib/letters";
import { useState, useEffect } from "react";

const tabs = [
  { path: "/", label: "Sent", icon: Send },
  { path: "/received", label: "Received", icon: Mail },
  { path: "/settings", label: "Settings", icon: Settings },
];

const BottomNav = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    const loadUnread = async () => {
      try {
        const count = await getUnreadCount();
        setUnread(count);
      } catch {
        setUnread(0);
      }
    };

    loadUnread();
    const interval = setInterval(loadUnread, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 w-[calc(100%-2.5rem)] max-w-5xl z-50">
      <div className="flex items-center justify-around rounded-full bg-card/90 backdrop-blur-lg border border-border py-2 px-4">
        {tabs.map((tab) => {
          const isActive = location.pathname === tab.path;
          return (
            <button
              key={tab.path}
              onClick={() => navigate(tab.path)}
              className={`relative flex items-center justify-center w-12 h-12 rounded-full transition-all duration-200 ${
                isActive
                  ? "bg-primary/20 text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              style={{ WebkitTapHighlightColor: 'transparent' }}
            >
              <tab.icon size={20} />
              {tab.label === "Received" && unread > 0 && (
                <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default BottomNav;
