import { type ReactElement } from 'react';
import type { IconProviderClient } from '../providers/types.js';
declare const PAGE_SIZE = 100;
export type IconPickerDropdownProps = {
    client: IconProviderClient;
    expandedCategory: null | string;
    expandedVariants: string[];
    matchingCategories: string[];
    onCloseVariants: () => void;
    onPageChange: (delta: number) => void;
    onSelect: (iconName: string) => void;
    onToggleExpand: (category: string) => void;
    page: number;
    paginatedCategories: string[];
    search: string;
    selectedValue: string;
    totalMatchingIcons: number;
    totalPages: number;
};
export declare function IconPickerDropdown({ client, expandedCategory, expandedVariants, matchingCategories, onCloseVariants, onPageChange, onSelect, onToggleExpand, page, paginatedCategories, search, selectedValue, totalMatchingIcons, totalPages, }: IconPickerDropdownProps): ReactElement;
export declare function useIconPickerSearch(client: IconProviderClient, search: string): {
    matchingCategories: string[];
    totalMatchingIcons: number;
};
export { PAGE_SIZE };
