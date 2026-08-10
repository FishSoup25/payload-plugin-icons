'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useMemo } from 'react';
import { SerializedIconSvg } from '../components/Icon.js';
import { useIconDefinitions } from '../providers/clientApi.js';
const PAGE_SIZE = 100;
function PickerGlyph({ definition, size }) {
    return definition ? /*#__PURE__*/ _jsx(SerializedIconSvg, {
        definition: definition,
        size: size,
        strokeWidth: 1.5
    }) : null;
}
function IconCategoryCell({ category, categoryMap, client, definitions, expandedCategory, onSelect, onToggleExpand, selectedValue }) {
    const icons = categoryMap[category] ?? [];
    const representative = client.getCategoryRepresentative(category);
    const hasVariants = icons.length > 1;
    const isExpanded = expandedCategory === category;
    return /*#__PURE__*/ _jsxs("div", {
        className: `category-cell${isExpanded ? ' expanded' : ''}`,
        children: [
            /*#__PURE__*/ _jsxs("button", {
                className: `icon-option${selectedValue === representative ? ' selected' : ''}`,
                onClick: ()=>onSelect(representative),
                title: `Select "${representative}"`,
                type: "button",
                children: [
                    /*#__PURE__*/ _jsx(PickerGlyph, {
                        definition: definitions[representative],
                        size: 24
                    }),
                    /*#__PURE__*/ _jsx("span", {
                        className: "icon-option-name",
                        children: category
                    })
                ]
            }),
            hasVariants && /*#__PURE__*/ _jsx("button", {
                className: `variant-badge${isExpanded ? ' active' : ''}`,
                onClick: ()=>onToggleExpand(category),
                title: isExpanded ? 'Collapse variants' : `${icons.length} variants`,
                type: "button",
                children: isExpanded ? '▲' : icons.length
            })
        ]
    });
}
function IconVariantsPanel({ category, definitions, onClose, onSelect, selectedValue, variants }) {
    return /*#__PURE__*/ _jsxs("div", {
        className: "variants-panel",
        children: [
            /*#__PURE__*/ _jsxs("div", {
                className: "variants-panel-header",
                children: [
                    /*#__PURE__*/ _jsxs("span", {
                        className: "variants-panel-title",
                        children: [
                            /*#__PURE__*/ _jsx("strong", {
                                children: category
                            }),
                            " variants",
                            ' ',
                            /*#__PURE__*/ _jsxs("span", {
                                className: "variants-panel-count",
                                children: [
                                    "(",
                                    variants.length,
                                    ")"
                                ]
                            })
                        ]
                    }),
                    /*#__PURE__*/ _jsx("button", {
                        className: "variants-close-btn",
                        onClick: onClose,
                        title: "Close",
                        type: "button",
                        children: "✕"
                    })
                ]
            }),
            /*#__PURE__*/ _jsx("div", {
                className: "icon-grid",
                children: variants.map((iconName)=>/*#__PURE__*/ _jsxs("button", {
                        className: `icon-option${selectedValue === iconName ? ' selected' : ''}`,
                        onClick: ()=>onSelect(iconName),
                        title: iconName,
                        type: "button",
                        children: [
                            /*#__PURE__*/ _jsx(PickerGlyph, {
                                definition: definitions[iconName],
                                size: 24
                            }),
                            /*#__PURE__*/ _jsx("span", {
                                className: "icon-option-name",
                                children: iconName
                            })
                        ]
                    }, iconName))
            })
        ]
    });
}
export function IconPickerDropdown({ client, expandedCategory, expandedVariants, matchingCategories, onCloseVariants, onPageChange, onSelect, onToggleExpand, page, paginatedCategories, search, selectedValue, totalMatchingIcons, totalPages }) {
    const categoryMap = useMemo(()=>client.getCategoryMap(), [
        client
    ]);
    const visibleNames = useMemo(()=>[
            ...paginatedCategories.map((category)=>client.getCategoryRepresentative(category)),
            ...expandedVariants
        ], [
        client,
        expandedVariants,
        paginatedCategories
    ]);
    const definitions = useIconDefinitions(client.id, visibleNames, 'regular');
    return /*#__PURE__*/ _jsxs("div", {
        className: "icon-picker-dropdown",
        children: [
            /*#__PURE__*/ _jsxs("div", {
                className: "dropdown-header",
                children: [
                    /*#__PURE__*/ _jsxs("span", {
                        className: "dropdown-count",
                        children: [
                            matchingCategories.length,
                            " categories · ",
                            totalMatchingIcons,
                            " icons"
                        ]
                    }),
                    totalPages > 1 && /*#__PURE__*/ _jsxs("div", {
                        className: "pagination",
                        children: [
                            /*#__PURE__*/ _jsx("button", {
                                className: "page-btn",
                                disabled: page === 0,
                                onClick: ()=>onPageChange(-1),
                                type: "button",
                                children: "‹"
                            }),
                            /*#__PURE__*/ _jsxs("span", {
                                className: "page-info",
                                children: [
                                    page + 1,
                                    " / ",
                                    totalPages
                                ]
                            }),
                            /*#__PURE__*/ _jsx("button", {
                                className: "page-btn",
                                disabled: page === totalPages - 1,
                                onClick: ()=>onPageChange(1),
                                type: "button",
                                children: "›"
                            })
                        ]
                    })
                ]
            }),
            /*#__PURE__*/ _jsx("div", {
                className: "icon-grid",
                children: paginatedCategories.map((category)=>/*#__PURE__*/ _jsx(IconCategoryCell, {
                        category: category,
                        categoryMap: categoryMap,
                        client: client,
                        definitions: definitions,
                        expandedCategory: expandedCategory,
                        onSelect: onSelect,
                        onToggleExpand: onToggleExpand,
                        selectedValue: selectedValue
                    }, category))
            }),
            expandedCategory && /*#__PURE__*/ _jsx(IconVariantsPanel, {
                category: expandedCategory,
                definitions: definitions,
                onClose: onCloseVariants,
                onSelect: onSelect,
                selectedValue: selectedValue,
                variants: expandedVariants
            }),
            matchingCategories.length === 0 && /*#__PURE__*/ _jsxs("div", {
                className: "no-results",
                children: [
                    'No icons found matching "',
                    search,
                    '"'
                ]
            })
        ]
    });
}
export function useIconPickerSearch(client, search) {
    return useMemo(()=>{
        const categoryMap = client.getCategoryMap();
        const allCategoryKeys = Object.keys(categoryMap).sort();
        const allIconNames = client.getIconNames();
        if (!search) {
            return {
                matchingCategories: allCategoryKeys,
                totalMatchingIcons: allIconNames.length
            };
        }
        const lower = search.toLowerCase();
        let totalMatchingIcons = 0;
        const matchingCategories = Object.entries(categoryMap).filter(([, iconNames])=>{
            const matchCount = iconNames.filter((name)=>name.toLowerCase().includes(lower)).length;
            totalMatchingIcons += matchCount;
            return matchCount > 0;
        }).map(([category])=>category).sort();
        return {
            matchingCategories,
            totalMatchingIcons
        };
    }, [
        client,
        search
    ]);
}
export { PAGE_SIZE };

//# sourceMappingURL=iconPickerUi.js.map