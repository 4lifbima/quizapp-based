import { Home, Trophy, User, PlusCircle, LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

type NavItem = {
  id: string;
  label: string;
  icon: typeof Home;
};

const navItems: NavItem[] = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'create', label: 'Create Quiz', icon: PlusCircle },
  { id: 'scores', label: 'My Scores', icon: Trophy },
  { id: 'profile', label: 'Profile', icon: User },
];

type SidebarProps = {
  activeTab: string;
  onTabChange: (tab: string) => void;
};

export default function Sidebar({ activeTab, onTabChange }: SidebarProps) {
  const { signOut } = useAuth();

  return (
    <aside className="hidden md:flex md:flex-col md:w-64 bg-white border-r border-gray-200 h-screen fixed left-0 top-0">
      <div className="p-6 border-b border-gray-200">
        <h1 className="text-2xl font-bold text-[#571fff]">Quizez</h1>
        <p className="text-sm text-gray-600 mt-1">Test Your Knowledge</p>
      </div>

      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <li key={item.id}>
                <button
                  onClick={() => onTabChange(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                    isActive
                      ? 'bg-[#571fff] text-white shadow-lg shadow-[#571fff]/30'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Icon size={20} />
                  <span className="font-medium">{item.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="p-4 border-t border-gray-200">
        <button
          onClick={() => signOut()}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
        >
          <LogOut size={20} />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </aside>
  );
}
