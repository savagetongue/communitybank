import { Link, NavLink } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu, Clock } from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';
import { cn } from '@/lib/utils';
export function Header() {
  const navLinks = [
    { to: '/offers', text: 'Offers' },
    { to: '/#how-it-works', text: 'How It Works' },
  ];
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-6">
            <Link to="/" className="flex items-center gap-2">
              <Clock className="h-6 w-6 text-brand" />
              <span className="font-display text-xl font-semibold">ChronoBank</span>
            </Link>
            <nav className="hidden md:flex items-center gap-6">
              {navLinks.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  className={({ isActive }) =>
                    cn(
                      'text-sm font-medium text-muted-foreground transition-colors hover:text-foreground',
                      isActive && 'text-foreground'
                    )
                  }
                >
                  {link.text}
                </NavLink>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-2">
            <div className="hidden md:flex items-center gap-2">
              <Button variant="ghost">Log In</Button>
              <Button>Sign Up</Button>
            </div>
            <ThemeToggle className="relative top-0 right-0" />
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="md:hidden">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle Menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right">
                <div className="grid gap-4 py-4">
                  <Link to="/" className="flex items-center gap-2 mb-4">
                    <Clock className="h-6 w-6 text-brand" />
                    <span className="font-display text-xl font-semibold">ChronoBank</span>
                  </Link>
                  {navLinks.map((link) => (
                    <NavLink
                      key={link.to}
                      to={link.to}
                      className="text-lg font-medium text-muted-foreground hover:text-foreground"
                    >
                      {link.text}
                    </NavLink>
                  ))}
                  <div className="flex flex-col gap-2 mt-4">
                    <Button variant="ghost">Log In</Button>
                    <Button>Sign Up</Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}