export const selection = `
  <div className="w-full white-space-nowrap overflow-hidden text-overflow-ellipsis">
    {value ?? (!isEditable && <span className="pl-2">-</span>)}
  </div>
`;
