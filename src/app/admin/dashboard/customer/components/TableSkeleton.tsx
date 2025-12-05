import React from "react";

interface TableSkeletonProps {
  rows?: number;
  columns?: number;
}

const TableSkeleton: React.FC<TableSkeletonProps> = ({
  rows = 5,
  columns = 5,
}) => {
  return (
    <>
      {[...Array(rows)].map((_, rowIndex) => (
        <tr key={rowIndex}>
          {[...Array(columns)].map((_, colIndex) => (
            <td key={colIndex} className="px-6 py-4">
              <div className="h-4 bg-gray-200 rounded animate-pulse w-full" />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
};

export default TableSkeleton;
