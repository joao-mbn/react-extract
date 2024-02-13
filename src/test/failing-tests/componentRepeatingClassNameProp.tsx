export const selection = `
  <div className="flex flex-row align-items-end">
    <div className="flex gap-1">
      <span
        className={classNames('cursor-pointer', {
          'font-bold text-primary': selected === InputMode.Multiselection,
        })}
        onClick={onMultiselectionClick}>
        {T.REPORTS.MULTISELECTION}
      </span>
      {' | '}
      <span
        className={classNames('cursor-pointer', {
          'font-bold text-primary': selected === InputMode.Range,
        })}
        onClick={onRangeClick}>
        {T.REPORTS.RANGE}
      </span>
    </div>
    <>
      <Tooltip target={\`#\${id}\`} />
      <i
        className="pi pi-info-circle text-xs pl-1 mr-2"
        data-pr-tooltip={tooltip}
        id={id}
      />
    </>
  </div>
`;

export const anotherSelection = `
  <ColumnGroup>
    <Row className="w-full">
      <Column
        colSpan={1}
        header={T.JOB_INSTRUCTION.NUMBER}
        style={{ width: '8%' }}
      />
      <Column
        colSpan={1}
        header={T.JOB_INSTRUCTION.REVISION_DATE}
        style={{ width: '12%' }}
      />
      <Column
        colSpan={1}
        header={T.JOB_INSTRUCTION.REVISION_LEVEL}
        style={{ width: '8%' }}
      />
      <Column
        colSpan={1}
        header={T.JOB_INSTRUCTION.CUSTOMERS}
        style={{ width: '12%' }}
      />
      <Column
        colSpan={1}
        header={T.JOB_INSTRUCTION.CUSTOMER_PART_NUMBERS}
        style={{ width: '18%' }}
      />
      <Column
        colSpan={1}
        header={T.JOB_INSTRUCTION.DATA_SHEETS}
        style={{ width: '6%' }}
      />
      <Column
        colSpan={1}
        header={T.PLANT_DATA.PLANT_DATA}
        style={{ width: '6%' }}
      />
      <Column
        className="flex justify-content-end"
        colSpan={2}
        header={header}
        style={{ minWidth: '30%' }}
      />
    </Row>
  </ColumnGroup>
`;
