import { proxy, useSnapshot } from "valtio";

interface MenuState {
  isOpen: boolean;
  toggleSidebar: () => void;
}

class MenuSidebar implements MenuState {
  public isOpen: boolean;

  constructor() {
    this.isOpen = true;
  }

  toggleSidebar() {
    this.isOpen = !this.isOpen;
  }
}

export const menuStore = proxy(new MenuSidebar());

// Hook to use the menu state
export const useMenuState = () => {
  return useSnapshot(menuStore);
};

// Hook with renamed properties to match the component
export const useMenuSidebar = () => {
  const state = useSnapshot(menuStore);
  return {
    isOpen: state.isOpen,
    toggleSidebar: menuStore.toggleSidebar.bind(menuStore)
  };
};
