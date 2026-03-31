'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Suspense, useMemo } from 'react';
import { getProviderClientById } from '../providers/registry.js';
import './IconCell.scss';
function mergeCellProps(props) {
    const nested = props.clientProps;
    return {
        labelsById: props.labelsById ?? nested?.labelsById,
        providerIds: props.providerIds ?? nested?.providerIds
    };
}
function normalizeCellData(cellData) {
    if (!cellData || typeof cellData !== 'object') {
        return undefined;
    }
    if (!('provider' in cellData) || !('name' in cellData)) {
        return undefined;
    }
    const { name, provider } = cellData;
    if (typeof provider !== 'string' || typeof name !== 'string') {
        return undefined;
    }
    return {
        name,
        provider
    };
}
export const IconCell = (props)=>{
    const { cellData } = props;
    const { labelsById } = mergeCellProps(props);
    const data = normalizeCellData(cellData);
    const client = useMemo(()=>{
        if (!data?.provider) {
            return undefined;
        }
        return getProviderClientById(data.provider, labelsById);
    }, [
        data?.provider,
        labelsById
    ]);
    const Glyph = useMemo(()=>{
        if (!client || !data?.name) {
            return null;
        }
        return client.resolveIconComponent(data.name);
    }, [
        client,
        data?.name
    ]);
    if (!data?.name) {
        return /*#__PURE__*/ _jsx("span", {
            className: "icon-cell-empty",
            children: "—"
        });
    }
    if (!client) {
        return /*#__PURE__*/ _jsx("div", {
            className: "icon-cell",
            children: /*#__PURE__*/ _jsxs("span", {
                className: "icon-cell-name",
                children: [
                    data.provider,
                    ":",
                    data.name
                ]
            })
        });
    }
    return /*#__PURE__*/ _jsxs("div", {
        className: "icon-cell",
        children: [
            /*#__PURE__*/ _jsx(Suspense, {
                fallback: /*#__PURE__*/ _jsx("span", {
                    className: "icon-placeholder-sm"
                }),
                children: Glyph ? /*#__PURE__*/ _jsx(Glyph, {
                    size: 20,
                    strokeWidth: 1.5,
                    weight: "regular"
                }) : null
            }),
            /*#__PURE__*/ _jsxs("span", {
                className: "icon-cell-name",
                children: [
                    data.provider,
                    " · ",
                    data.name
                ]
            })
        ]
    });
};

//# sourceMappingURL=IconCell.js.map