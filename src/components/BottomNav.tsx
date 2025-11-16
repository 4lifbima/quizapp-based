import { Home, Trophy, User, PlusCircle } from 'lucide-react';

type NavItem = {
  id: string;
  label: string;
  icon: typeof Home;
};

const navItems: NavItem[] = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'create', label: 'Create', icon: PlusCircle },
  { id: 'scores', label: 'Scores', icon: Trophy },
  { id: 'profile', label: 'Profile', icon: User },
];

type BottomNavProps = {
  activeTab: string;
  onTabChange: (tab: string) => void;
};

export default function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 md:hidden z-50">
      <div className="flex justify-around items-center h-16">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
                isActive
                  ? 'text-[#571fff]'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
              <span className={`text-xs mt-1 ${isActive ? 'font-semibold' : 'font-medium'}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
