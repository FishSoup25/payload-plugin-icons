import type { GroupFieldClientComponent, GroupFieldClientProps } from 'payload';
import './IconSelectField.scss';
/** Serialized `clientProps` from `iconField()` (also merged onto root props by the admin). */
export type IconSelectClientProps = {
    labelsById?: Record<string, string>;
    providerIds?: string[];
};
/**
 * Props the picker actually receives: Payload group field props plus optional plugin options.
 */
export type IconSelectFieldProps = {
    clientProps?: IconSelectClientProps;
} & GroupFieldClientProps & Partial<IconSelectClientProps>;
export declare const IconSelectField: GroupFieldClientComponent;
