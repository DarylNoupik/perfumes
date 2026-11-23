import { createContext, useContext } from "react";

export const ShopContext = createContext(null);
export const useStore = () => useContext(ShopContext);
