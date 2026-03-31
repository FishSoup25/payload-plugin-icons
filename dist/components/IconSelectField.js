'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useField } from '@payloadcms/ui';
import { groupHasName } from 'payload/shared';
import { useEffect, useMemo, useRef, useState } from 'react';
import { IconPickerDropdown, PAGE_SIZE, useIconPickerSearch } from '../lib/iconPickerUi.js';
import { getProviderClients } from '../providers/registry.js';
import './IconSelectField.scss';
const noopClient = {
    id: 'noop',
    getCategoryMap: ()=>({}),
    getCategoryRepresentative: (c)=>c,
    getIconNames: ()=>[],
    label: 'noop',
    resolveIconComponent: ()=>null
};
function pickIconClientProps(props) {
    const nested = props.clientProps;
    return {
        labelsById: props.labelsById ?? nested?.labelsById,
        providerIds: props.providerIds ?? nested?.providerIds
    };
}
function fieldLabelText(props) {
    const { field } = props;
    if (typeof field.label === 'string') {
        return field.label;
    }
    if (groupHasName(field)) {
        return field.name;
    }
    return 'Icon';
}
/** `NamedGroupFieldClient` omits `required` in Payload typings; runtime field config may still include it. */ function fieldIsRequired(props) {
    const { field } = props;
    if (!groupHasName(field)) {
        return false;
    }
    return Boolean(field.required);
}
export const IconSelectField = (props)=>{
    const { path, readOnly } = props;
    const { labelsById, providerIds = [
        'lucide',
        'phosphor'
    ] } = pickIconClientProps(props);
    const providers = useMemo(()=>getProviderClients(providerIds, labelsById), [
        providerIds,
        labelsById
    ]);
    const providerPath = `${path}.provider`;
    const namePath = `${path}.name`;
    const { setValue: setProvider, value: providerValue } = useField({
        path: providerPath
    });
    const { setValue: setName, value: nameValue } = useField({
        path: namePath
    });
    const firstId = providers[0]?.id ?? providerIds[0] ?? 'lucide';
    useEffect(()=>{
        if (!providerValue && firstId) {
            void setProvider(firstId);
        }
    }, [
        providerValue,
        setProvider,
        firstId
    ]);
    const activeProviderId = providerValue || firstId;
    const activeClient = useMemo(()=>providers.find((p)=>p.id === activeProviderId) ?? providers[0], [
        providers,
        activeProviderId
    ]);
    const [search, setSearch] = useState('');
    const [showPicker, setShowPicker] = useState(false);
    const [page, setPage] = useState(0);
    const [expandedCategory, setExpandedCategory] = useState(null);
    const dropdownRef = useRef(null);
    const { matchingCategories, totalMatchingIcons } = useIconPickerSearch(activeClient ?? providers[0] ?? noopClient, search);
    const handleProviderChange = (nextId)=>{
        void setProvider(nextId);
        void setName('');
        setSearch('');
        setPage(0);
        setExpandedCategory(null);
    };
    const totalPages = Math.ceil(matchingCategories.length / PAGE_SIZE) || 1;
    const paginatedCategories = matchingCategories.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
    useEffect(()=>{
        const handleClickOutside = (e)=>{
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setShowPicker(false);
            }
        };
        if (showPicker) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return ()=>{
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [
        showPicker
    ]);
    const handleSelect = (iconName)=>{
        void setName(iconName);
        setSearch('');
        setShowPicker(false);
        setExpandedCategory(null);
    };
    const toggleExpand = (category)=>{
        setExpandedCategory((prev)=>prev === category ? null : category);
    };
    const handlePageChange = (delta)=>{
        setPage((p)=>Math.max(0, Math.min(totalPages - 1, p + delta)));
        setExpandedCategory(null);
    };
    const categoryMap = useMemo(()=>activeClient?.getCategoryMap() ?? {}, [
        activeClient
    ]);
    const expandedVariants = useMemo(()=>{
        if (!expandedCategory || !activeClient) {
            return [];
        }
        const icons = categoryMap[expandedCategory] ?? [];
        if (!search) {
            return icons;
        }
        const lower = search.toLowerCase();
        return icons.filter((n)=>String(n).toLowerCase().includes(lower));
    }, [
        expandedCategory,
        search,
        activeClient,
        categoryMap
    ]);
    const PreviewCmp = useMemo(()=>{
        if (!nameValue || !activeClient) {
            return null;
        }
        return activeClient.resolveIconComponent(nameValue);
    }, [
        activeClient,
        nameValue
    ]);
    const labelText = fieldLabelText(props);
    const required = fieldIsRequired(props);
    const { field } = props;
    if (!activeClient) {
        return /*#__PURE__*/ _jsx("div", {
            className: "icon-select-field",
            children: "No icon providers configured."
        });
    }
    return /*#__PURE__*/ _jsxs("div", {
        className: "icon-select-field",
        ref: dropdownRef,
        children: [
            /*#__PURE__*/ _jsx("div", {
                className: "field-label-wrapper",
                children: /*#__PURE__*/ _jsxs("label", {
                    className: "field-label",
                    children: [
                        labelText,
                        required && /*#__PURE__*/ _jsx("span", {
                            className: "required",
                            children: "*"
                        })
                    ]
                })
            }),
            /*#__PURE__*/ _jsxs("div", {
                className: "icon-provider-row",
                children: [
                    /*#__PURE__*/ _jsx("label", {
                        className: "icon-provider-label",
                        htmlFor: `${path}-provider`,
                        children: "Provider"
                    }),
                    /*#__PURE__*/ _jsx("select", {
                        className: "icon-provider-select",
                        disabled: readOnly ?? providers.length <= 1,
                        id: `${path}-provider`,
                        onChange: (e)=>handleProviderChange(e.target.value),
                        value: activeProviderId,
                        children: providers.map((p)=>/*#__PURE__*/ _jsx("option", {
                                value: p.id,
                                children: p.label
                            }, p.id))
                    })
                ]
            }),
            /*#__PURE__*/ _jsx("div", {
                className: "icon-search-wrapper",
                children: /*#__PURE__*/ _jsx("input", {
                    className: "icon-search-input",
                    onChange: (e)=>setSearch(e.target.value),
                    onFocus: ()=>setShowPicker(true),
                    placeholder: "Search icons... (e.g., shield, home, user)",
                    readOnly: readOnly,
                    type: "text",
                    value: search
                })
            }),
            nameValue && /*#__PURE__*/ _jsxs("div", {
                className: "selected-icon-preview",
                children: [
                    /*#__PURE__*/ _jsx("div", {
                        className: "preview-label",
                        children: "Selected icon"
                    }),
                    /*#__PURE__*/ _jsxs("div", {
                        className: "preview-content",
                        children: [
                            /*#__PURE__*/ _jsx("span", {
                                className: "preview-provider-badge",
                                children: activeClient.label
                            }),
                            PreviewCmp ? /*#__PURE__*/ _jsx(PreviewCmp, {
                                size: 32,
                                strokeWidth: 1.5,
                                weight: "regular"
                            }) : null,
                            /*#__PURE__*/ _jsx("span", {
                                className: "icon-name",
                                children: nameValue
                            }),
                            !readOnly && /*#__PURE__*/ _jsx("button", {
                                className: "clear-button",
                                onClick: ()=>{
                                    void setName('');
                                },
                                type: "button",
                                children: "Clear"
                            })
                        ]
                    })
                ]
            }),
            showPicker && !readOnly && /*#__PURE__*/ _jsx(IconPickerDropdown, {
                client: activeClient,
                expandedCategory: expandedCategory,
                expandedVariants: expandedVariants,
                matchingCategories: matchingCategories,
                onCloseVariants: ()=>setExpandedCategory(null),
                onPageChange: handlePageChange,
                onSelect: handleSelect,
                onToggleExpand: toggleExpand,
                page: page,
                paginatedCategories: paginatedCategories,
                search: search,
                selectedValue: nameValue ?? '',
                totalMatchingIcons: totalMatchingIcons,
                totalPages: totalPages
            }),
            field.admin && 'description' in field.admin && field.admin.description && /*#__PURE__*/ _jsx("div", {
                className: "field-description",
                children: typeof field.admin.description === 'string' ? field.admin.description : String(field.admin.description)
            })
        ]
    });
};

//# sourceMappingURL=IconSelectField.js.map