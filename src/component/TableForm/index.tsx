import React from "react";
import { Form, Input, Select, Table } from 'antd'

interface TableConfig {
    type?: 'Input' | 'Select';
    [x: string]: any;

}

interface TableFormProps {
    value?: any[];
    name: string;
    onChange?: () => void;
    tableConfig?: Array<TableConfig>
}

const defaultColumn = [{
    dataIndex: 'key',
    title: 'No',
}, {
    dataIndex: 'title',
    title: 'Title',
}, {
    dataIndex: 'impact',
    title: 'Impact',
    type: 'Select',
    props: {
        options: [{ value: '123', label: 'Test' }],
    }
}, {
    dataIndex: 'justification',
    title: 'Justification',
    type: 'Input'
}]

export const TableForm: React.FC<TableFormProps> = ({ name, value, onChange }) => {

    const renderColumn = () => {
        return defaultColumn?.map(item => {
            if (!item.type) return item;
            switch (item.type) {
                case 'Input':
                    return {
                        ...item,
                        render: (_: any, record: any) => {
                            const fieldKey = record.key;
                            return <Form.Item dependencies={[[fieldKey, 'impact']]} rules={[({ getFieldValue }) => {
                                const impactValue = getFieldValue([name, fieldKey, 'impact']);
                                console.log(impactValue)
                                return {}
                            }]} name={[fieldKey, item.dataIndex]}>
                                <Input />
                            </Form.Item>
                        }
                    }
                case 'Select':
                    return {
                        ...item,
                        render: (_: any, record: any) => {
                            const fieldKey = record.key;
                            return <Form.Item name={[fieldKey, item.dataIndex]}>
                                <Select {...item.props} />
                            </Form.Item>
                        }
                    }
                default:
                    return {
                        ...item,
                    };
            }
        })
    }

    return (
        <Form.List name={name}>
            {
                (field) => {
                    return <Table dataSource={field} pagination={false} columns={renderColumn() as any}></Table>
                }
            }
        </Form.List>
    )
}

export default TableForm