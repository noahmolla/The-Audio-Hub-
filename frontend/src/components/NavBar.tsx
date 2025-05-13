"use client";

import type React from "react";
import { useAuth } from "@/context/AuthContext";
import { ThemeSwitcherButton } from "@/components/ThemeSwitcherButton";
import { cn } from "@/lib/utils";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Home, LayoutDashboard, Headphones, UploadCloud, User } from "lucide-react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";

const navList = [
  { label: "Home", link: "/", protected: false, icon: Home },
  { label: "Dashboard", link: "/file_path_view_all", protected: true, icon: LayoutDashboard },
  { label: "Listen to Local Files", link: "/listening_page", protected: true, icon: Headphones },
  { label: "Upload Files to Cloud", link: "/uploading_file_path", protected: true, icon: UploadCloud },
  { label: "About Us", link: "/about", protected: false },
];

function NavBar() {
  const pathname = usePathname();
  const { token, logout } = useAuth();
  const router = useRouter();

  // Filter navigation items based on authentication
  const filteredNavList = navList.filter((item) => !item.protected || token);

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background">
      <div className="container mx-auto px-4">
        <nav className="flex h-16 items-center relative">
          {/* Logo - Left */}
          <div className="flex items-center gap-2">
            <Link href="/" className="flex items-center gap-2">
              <Image
                src="/logoAudioHub.png"
                alt="Audio Hub Logo"
                width={40}
                height={40}
                className="h-10 w-10 object-contain"
              />
              <span className="text-xl font-bold hidden sm:inline-block">The Audio Hub</span>
            </Link>
          </div>

          {/* Desktop Nav Items - Centered */}
          <div className="hidden md:flex items-center absolute left-1/2 transform -translate-x-1/2">
            <div className="flex items-center space-x-4">
              {filteredNavList.map((item) => (
                <NavbarItem key={item.label} link={item.link} label={item.label} icon={item.icon} />
              ))}
            </div>
          </div>

          {/* Actions - Right */}
          <div className="ml-auto flex items-center gap-2">
            <ThemeSwitcherButton />

            <DropdownMenu.Root>
              <DropdownMenu.Trigger asChild>
                <button className="flex items-center justify-center h-10 w-10 rounded-full hover:bg-accent">
                  <User className="h-5 w-5 text-muted-foreground hover:text-foreground" />
                </button>
              </DropdownMenu.Trigger>

              <DropdownMenu.Content
                align="end"
                sideOffset={5}
                className="
                  bg-white
                  dark:bg-black
                  dark:text-white
                  shadow-md
                  rounded-md
                  p-2
                  w-40
                "
              >
                <DropdownMenu.Item asChild>
                  <Link
                    href="/account_page"
                    className="
                      block px-4 py-2
                      text-sm text-muted-foreground
                      dark:text-white
                      hover:bg-gray-100
                      dark:hover:bg-gray-700
                      dark:hover:text-white
                      rounded-md
                    "
                  >
                    View Account
                  </Link>
                </DropdownMenu.Item>

                <DropdownMenu.Separator className="my-1 h-px bg-gray-200 dark:bg-gray-700" />

                <DropdownMenu.Item
                  onClick={() => {
                    logout(); // clear context/token
                    router.push("/sign_in_sign_up/sign-in"); // redirect after logout
                  }}
                  className="
                    block px-4 py-2
                    text-sm text-muted-foreground
                    dark:text-white
                    hover:bg-gray-100
                    dark:hover:bg-gray-700
                    dark:hover:text-white
                    rounded-md
                    cursor-pointer
                  "
                >
                  Logout
                </DropdownMenu.Item>
              </DropdownMenu.Content>
            </DropdownMenu.Root>
          </div>
        </nav>
      </div>

      {/* Mobile Nav */}
      <div className="md:hidden border-t">
        <div className="container mx-auto px-4">
          <div className="flex justify-between">
            {filteredNavList.map((item) => (
              <MobileNavItem key={item.label} link={item.link} label={item.label} icon={item.icon} />
            ))}
          </div>
        </div>
      </div>
    </header>
  );
}

interface NavbarItemProps {
  link: string;
  label: string;
  icon?: React.ElementType;
  clickCallBack?: () => void;
}

function NavbarItem({ link, label, icon: Icon, clickCallBack }: NavbarItemProps) {
  const pathname = usePathname();
  const isActive = pathname === link;

  return (
    <Link
      href={link}
      onClick={() => clickCallBack?.()}
      className={cn(
        "relative px-3 py-2 text-sm font-medium transition-colors flex items-center gap-2 rounded-md",
        isActive ? "text-red-600" : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
      )}
    >
      {Icon && <Icon className="h-4 w-4" />}
      {label}
      {isActive && <span className="absolute -bottom-[1px] left-0 right-0 h-[2px] bg-red-600" />}
    </Link>
  );
}

function MobileNavItem({ link, label, icon: Icon }: NavbarItemProps) {
  const pathname = usePathname();
  const isActive = pathname === link;

  return (
    <Link
      href={link}
      className={cn(
        "flex flex-col items-center justify-center py-2 px-1 text-xs",
        isActive ? "text-amber-500" : "text-muted-foreground"
      )}
    >
      {Icon && <Icon className="h-5 w-5 mb-1" />}
      <span className="max-w-[80px] truncate">{label}</span>
    </Link>
  );
}

export default NavBar;
