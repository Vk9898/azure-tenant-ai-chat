import { MenuTrayToggle } from "@/features/main-menu/menu-tray-toggle";
import {
  Menu,
  MenuBar,
  MenuItem,
  MenuItemContainer,
  menuIconProps,
} from "@/ui/menu";
import {
  Book,
  Home,
  MessageCircle,
  PocketKnife,
  Sheet,
  VenetianMask,
} from "lucide-react";
import { getCurrentUser } from "../auth-page/helpers";
import { MenuLink } from "./menu-link";
import { UserProfile } from "./user-profile";

export const MainMenu = async () => {
  const user = await getCurrentUser();
  const isAdmin = user.isAdmin;

  return (
    <Menu>
      <MenuBar className="border-r-2 border-border bg-sidebar">
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
          
          {/* Only show these menu items for admin users */}
          {isAdmin && (
            <>
              <MenuItem tooltip="Persona">
                <MenuLink href="/persona" ariaLabel="Go to the Persona configuration page" className="ds-touch-target">
                  <VenetianMask {...menuIconProps} className="text-sidebar-foreground" />
                </MenuLink>
              </MenuItem>
              <MenuItem tooltip="Extensions">
                <MenuLink href="/extensions" ariaLabel="Go to the Extensions configuration page" className="ds-touch-target">
                  <PocketKnife {...menuIconProps} className="text-sidebar-foreground" />
                </MenuLink>
              </MenuItem>
              <MenuItem tooltip="Prompts">
                <MenuLink href="/prompt" ariaLabel="Go to the Prompt Library configuration page" className="ds-touch-target">
                  <Book {...menuIconProps} className="text-sidebar-foreground" />
                </MenuLink>
              </MenuItem>
              <MenuItem tooltip="Reporting">
                <MenuLink href="/reporting" ariaLabel="Go to the Admin reporting" className="ds-touch-target">
                  <Sheet {...menuIconProps} className="text-sidebar-foreground" />
                </MenuLink>
              </MenuItem>
            </>
          )}
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
