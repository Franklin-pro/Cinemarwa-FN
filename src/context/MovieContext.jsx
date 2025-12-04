import { createContext, useContext } from "react";

export const MovieContext = createContext();

export const useMovies = () => useContext(MovieContext);
