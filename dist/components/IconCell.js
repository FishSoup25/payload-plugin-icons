'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Icon } from './Icon.js';
import './IconCell.scss';
function mergeCellProps(props) {
    return {
        labelsById: props.labelsById ?? props.clientProps?.labelsById,
        providerIds: props.providerIds ?? props.clientProps?.providerIds
    };
}
function normalizeCellData(cellData) {
    if (!cellData || typeof cellData !== 'object' || !('provider' in cellData) || !('name' in cellData)) {
        return;
    }
    const { name, provider } = cellData;
    return typeof provider === 'string' && typeof name === 'string' ? {
        name,
        provider
    } : undefined;
}
export const IconCell = (props)=>{
    const { labelsById } = mergeCellProps(props);
    const data = normalizeCellData(props.cellData);
    if (!data?.name) {
        return /*#__PURE__*/ _jsx("span", {
            className: "icon-cell-empty",
            children: "—"
        });
    }
    return /*#__PURE__*/ _jsxs("div", {
        className: "icon-cell",
        children: [
            /*#__PURE__*/ _jsx(Icon, {
                icon: data,
                size: 20,
                strokeWidth: 1.5
            }),
            /*#__PURE__*/ _jsxs("span", {
                className: "icon-cell-name",
                children: [
                    labelsById?.[data.provider] ?? data.provider,
                    " · ",
                    data.name
                ]
            })
        ]
    });
};

//# sourceMappingURL=IconCell.js.map