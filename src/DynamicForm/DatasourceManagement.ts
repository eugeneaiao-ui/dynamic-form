import { DataSourceType } from "./AsyncFormFields";
import { DataSource, FormFields } from "./FormTemplate";

const PREDEFINED_DATA_SOURCES: any = {
    [FormFields.country]: {
        type: DataSourceType.STORE,
        module: 'common',
        storeKey: FormFields.country
    }
}

export class DataSourceManager {
    static getDataSource(field: FormFields | string): DataSource | undefined {
        return PREDEFINED_DATA_SOURCES[field as FormFields];
    }

    // 批量获取数据源
    static getDataSources(fields: (FormFields | string)[]): Record<string, DataSource> {
        const result: Record<string, DataSource> = {};
        fields.forEach(field => {
            const dataSource = this.getDataSource(field);
            if (dataSource) {
                result[field] = dataSource;
            }
        });
        return result;
    }

    // 注册新的数据源
    static registerDataSource(key: string, config: DataSource): void {
        PREDEFINED_DATA_SOURCES[key] = config;
    }
}