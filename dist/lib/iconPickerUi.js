'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Suspense, useMemo } from 'react';
const PAGE_SIZE = 100;
function PickerGlyph({ client, iconName, size }) {
    const Cmp = useMemo(()=>client.resolveIconComponent(iconName), [
        client,
        iconName
    ]);
    if (!Cmp) {
        return null;
    }
    return /*#__PURE__*/ _jsx(Cmp, {
        size: size,
        strokeWidth: 1.5,
        weight: "regular"
    });
}
function IconCategoryCell({ category, categoryMap, client, expandedCategory, onSelect, onToggleExpand, selectedValue }) {
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
                    /*#__PURE__*/ _jsx(Suspense, {
                        fallback: /*#__PURE__*/ _jsx("span", {
                            className: "icon-placeholder-sm"
                        }),
                        children: /*#__PURE__*/ _jsx(PickerGlyph, {
                            client: client,
                            iconName: representative,
                            size: 24
                        })
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
function IconVariantsPanel({ category, client, onClose, onSelect, selectedValue, variants }) {
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
                            /*#__PURE__*/ _jsx(Suspense, {
                                fallback: /*#__PURE__*/ _jsx("span", {
                                    className: "icon-placeholder-sm"
                                }),
                                children: /*#__PURE__*/ _jsx(PickerGlyph, {
                                    client: client,
                                    iconName: iconName,
                                    size: 24
                                })
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
                        expandedCategory: expandedCategory,
                        onSelect: onSelect,
                        onToggleExpand: onToggleExpand,
                        selectedValue: selectedValue
                    }, category))
            }),
            expandedCategory && /*#__PURE__*/ _jsx(IconVariantsPanel, {
                category: expandedCategory,
                client: client,
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
        const matched = new Set();
        for (const name of allIconNames){
            if (!String(name).toLowerCase().includes(lower)) {
                continue;
            }
            for (const c of Object.keys(categoryMap)){
                if (categoryMap[c].includes(name)) {
                    matched.add(c);
                    break;
                }
            }
        }
        const matchingCategories = Array.from(matched).sort();
        const totalMatchingIcons = allIconNames.filter((n)=>String(n).toLowerCase().includes(lower)).length;
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