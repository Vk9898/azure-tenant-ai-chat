import { MenuTrayToggle } from "@/components/main-menu-components/menu-tray-toggle";
import {
  Menu,
  MenuBar,
  MenuItem,
  MenuItemContainer,
  menuIconProps,
} from "@/components/ui/menu";
import {
  Book,
  Home,
  MessageCircle,
  PocketKnife,
  BarChart3,
  VenetianMask,
} from "lucide-react";
import { getCurrentUser } from "../../lib/auth/auth-helpers";
import { MenuLink } from "./menu-link";
import { UserProfile } from "./user-profile";
import { DropdownNavigation } from "./dropdown-navigation";

export const MainMenu = async () => {
  const user = await getCurrentUser();
  const isAdmin = user.isAdmin;

  return (
    <Menu data-slot="main-menu">
      <MenuBar className="border-r-2 border-sidebar-border bg-sidebar">
        <MenuItemContainer>
          <MenuItem tooltip="Home" asChild>
            <MenuLink href="/chat" ariaLabel="Go to the Home page" className="ds-touch-target">
              <Home {...menuIconProps} className="text-sidebar-foreground" />
            </MenuLink>
          </MenuItem>
          <MenuTrayToggle />
        </MenuItemContainer>
        <MenuItemContainer>
          <MenuItem tooltip="Chat">
            <MenuLink href="/chat" ariaLabel="Go to the Chat page" className="ds-touch-target">
              <MessageCircle {...menuIconProps} className="text-sidebar-foreground" />
            </MenuLink>
          </MenuItem>

          <MenuItem tooltip="Personas">
            <MenuLink href="/personas" ariaLabel="Go to the Personas page" className="ds-touch-target">
              <VenetianMask {...menuIconProps} className="text-sidebar-foreground" />
            </MenuLink>
          </MenuItem>

          <MenuItem tooltip="Extensions">
            <MenuLink href="/extensions" ariaLabel="Go to the Extensions page" className="ds-touch-target">
              <PocketKnife {...menuIconProps} className="text-sidebar-foreground" />
            </MenuLink>
          </MenuItem>

          {/* Admin-specific menu items */}
          {isAdmin && (
            <>
              <MenuItem tooltip="Prompts">
                <MenuLink href="/prompt" ariaLabel="Go to the Prompt Library page" className="ds-touch-target">
                  <Book {...menuIconProps} className="text-sidebar-foreground" />
                </MenuLink>
              </MenuItem>

              <MenuItem tooltip="Reporting">
                <MenuLink href="/admin/reporting" ariaLabel="Go to the Admin reporting page" className="ds-touch-target">
                  <BarChart3 {...menuIconProps} className="text-sidebar-foreground" />
                </MenuLink>
              </MenuItem>
            </>
          )}

          {/* More options dropdown */}
          <MenuItem tooltip="More Options">
            <div className="ds-touch-target" data-slot="dropdown-nav-trigger-wrapper">
              <DropdownNavigation isAdmin={isAdmin} />
            </div>
          </MenuItem>
        </MenuItemContainer>

        <MenuItemContainer>
          <MenuItem tooltip="Profile">
            <UserProfile />
          </MenuItem>
        </MenuItemContainer>
      </MenuBar>
    </Menu>
  );
};