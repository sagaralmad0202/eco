import { useDispatch, useSelector } from "react-redux";

/**
 * Custom hook to dispatch Redux actions.
 */
export const useAppDispatch = () => useDispatch();

/**
 * Custom hook to select state from the Redux store.
 */
export const useAppSelector = useSelector;
