export const selection = `
  <Column
    field="testCount"
    style={{ width: '6%' }}
    body={(row: any) => (
      <ListTemplate
        items={row.test ?? []}
        previewMode="count"
        onClick={() => {
          listType.current = 'test';
          setSelected(row);
          setListDialogVisible(true);
        }}>
        {row.testCount}
      </ListTemplate>
    )}
  />`;
