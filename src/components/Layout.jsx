import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { BookOpen, Library, Wrench, Settings, HelpCircle, ChevronDown, Bot, Sparkles, MessageCircle, Layers } from 'lucide-react';
import { useState } from 'react';

const mainNav = [
  { to: '/create', label: '开始创作', icon: BookOpen, desc: '新建或导入作品' },
  { to: '/works', label: '我的作品', icon: Library, desc: '管理已有作品' },
];

const toolNav = [
  { to: '/chat', label: 'AI 对话', icon: MessageCircle },
  { to: '/evolve', label: 'Prompt 进化', icon: Sparkles },
  { to: '/templates', label: '套路库', icon: Layers },
];

export function Layout() {
  const [toolsOpen, setToolsOpen] = useState(false);
  const location = useLocation();

  const isToolsActive = toolNav.some(t => location.pathname.startsWith(t.to));

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-slate-950">
      {/* Sidebar */}
      <aside className="lg:w-60 lg:shrink-0 border-b lg:border-b-0 lg:border-r border-slate-800/80 bg-slate-900/50 backdrop-blur-sm">
        <div className="sticky top-0 lg:h-screen flex flex-col">
          {/* Logo */}
          <div className="px-5 py-5">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-sky-500/15 border border-sky-500/25 flex items-center justify-center">
                <Bot size={20} className="text-sky-400" />
              </div>
              <div>
                <h1 className="text-base font-bold tracking-tight text-slate-50">AI 小说创作</h1>
                <div className="text-[10px] text-slate-500">knowrite 工作台</div>
              </div>
            </div>
          </div>

          <nav className="flex-1 overflow-auto px-3 pb-3 space-y-5">
            {/* 核心导航 */}
            <div>
              <div className="text-[10px] font-semibold text-slate-600 uppercase tracking-wider px-3 mb-1.5">创作</div>
              <div className="space-y-0.5">
                {mainNav.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    className={({ isActive }) =>
                      `group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-200 ${
                        isActive
                          ? 'bg-sky-500/10 text-sky-400 font-medium border border-sky-500/20'
                          : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200 border border-transparent'
                      }`
                    }
                  >
                    <item.icon size={17} className={location.pathname === item.to || location.pathname.startsWith(item.to + '/') ? 'text-sky-400' : 'text-slate-500 group-hover:text-slate-300'} />
                    <div className="flex-1 min-w-0">
                      <div>{item.label}</div>
                      <div className="text-[10px] text-slate-600 group-hover:text-slate-500">{item.desc}</div>
                    </div>
                  </NavLink>
                ))}
              </div>
            </div>

            {/* 工具导航 */}
            <div>
              <div className="text-[10px] font-semibold text-slate-600 uppercase tracking-wider px-3 mb-1.5">工具</div>
              <div className="space-y-0.5">
                {toolNav.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    className={({ isActive }) =>
                      `group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-200 ${
                        isActive
                          ? 'bg-sky-500/10 text-sky-400 font-medium border border-sky-500/20'
                          : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200 border border-transparent'
                      }`
                    }
                  >
                    <item.icon size={16} className={location.pathname === item.to ? 'text-sky-400' : 'text-slate-500 group-hover:text-slate-300'} />
                    <span>{item.label}</span>
                  </NavLink>
                ))}
              </div>
            </div>

            {/* 设置 */}
            <div>
              <div className="text-[10px] font-semibold text-slate-600 uppercase tracking-wider px-3 mb-1.5">系统</div>
              <div className="space-y-0.5">
                <NavLink
                  to="/settings"
                  className={({ isActive }) =>
                    `group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-200 ${
                      isActive
                        ? 'bg-sky-500/10 text-sky-400 font-medium border border-sky-500/20'
                        : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200 border border-transparent'
                    }`
                  }
                >
                  <Settings size={16} className={location.pathname === '/settings' ? 'text-sky-400' : 'text-slate-500 group-hover:text-slate-300'} />
                  <span>全局设置</span>
                </NavLink>
                <NavLink
                  to="/guide"
                  className={({ isActive }) =>
                    `group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-200 ${
                      isActive
                        ? 'bg-sky-500/10 text-sky-400 font-medium border border-sky-500/20'
                        : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200 border border-transparent'
                    }`
                  }
                >
                  <HelpCircle size={16} className={location.pathname === '/guide' ? 'text-sky-400' : 'text-slate-500 group-hover:text-slate-300'} />
                  <span>帮助指南</span>
                </NavLink>
              </div>
            </div>
          </nav>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 min-w-0">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-5 lg:py-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
