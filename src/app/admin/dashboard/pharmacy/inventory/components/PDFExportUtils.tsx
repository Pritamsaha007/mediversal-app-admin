import { inventoryItem } from "@/app/admin/dashboard/pharmacy/product/types/product";

// PDF Export utility functions
export const generateInventoryPDF = (
  products: inventoryItem[],
  filters: {
    searchTerm: string;
    selectedCategory: string;
    activeTab: string;
  }
) => {
  // Create PDF content as HTML string
  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>Inventory Report</title>
        <style>
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            margin: 0;
            padding: 20px;
            color: #333;
            line-height: 1.4;
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 2px solid #0088B1;
            padding-bottom: 20px;
          }
          .header h1 {
            color: #0088B1;
            margin-bottom: 5px;
            font-size: 28px;
          }
          .header p {
            color: #666;
            margin: 5px 0;
          }
          .filters {
            background-color: #f8f9fa;
            padding: 15px;
            border-radius: 8px;
            margin-bottom: 20px;
          }
          .filters h3 {
            margin-top: 0;
            color: #0088B1;
          }
          .filters-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 10px;
            margin-top: 10px;
          }
          .filter-item {
            background: white;
            padding: 8px 12px;
            border-radius: 4px;
            border-left: 3px solid #0088B1;
          }
          .filter-label {
            font-weight: 600;
            color: #333;
            font-size: 12px;
          }
          .filter-value {
            color: #666;
            font-size: 11px;
          }
          .summary {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
            gap: 15px;
            margin-bottom: 30px;
          }
          .summary-card {
            background: linear-gradient(135deg, #0088B1, #00A8CC);
            color: white;
            padding: 15px;
            border-radius: 8px;
            text-align: center;
          }
          .summary-card h4 {
            margin: 0 0 5px 0;
            font-size: 12px;
            opacity: 0.9;
          }
          .summary-card .number {
            font-size: 24px;
            font-weight: bold;
            margin: 0;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          }
          th {
            background-color: #0088B1;
            color: white;
            padding: 12px 8px;
            text-align: left;
            font-weight: 600;
            font-size: 11px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          td {
            padding: 10px 8px;
            border-bottom: 1px solid #eee;
            font-size: 11px;
          }
          tr:nth-child(even) {
            background-color: #f8f9fa;
          }
          tr:hover {
            background-color: #e3f2fd;
          }
          .status {
            padding: 4px 8px;
            border-radius: 12px;
            font-size: 10px;
            font-weight: 600;
            text-transform: uppercase;
          }
          .status.active {
            background-color: #d4edda;
            color: #155724;
          }
          .status.inactive {
            background-color: #f8d7da;
            color: #721c24;
          }
          .stock {
            font-weight: 600;
          }
          .stock.low {
            color: #856404;
          }
          .stock.out {
            color: #721c24;
          }
          .stock.good {
            color: #155724;
          }
          .expiry {
            font-weight: 500;
          }
          .expiry.expired {
            color: #721c24;
            font-weight: 600;
          }
          .expiry.warning {
            color: #856404;
            font-weight: 600;
          }
          .footer {
            margin-top: 30px;
            text-align: center;
            font-size: 10px;
            color: #666;
            border-top: 1px solid #ddd;
            padding-top: 20px;
          }
          @media print {
            body { margin: 0; }
            .header { page-break-after: avoid; }
            table { page-break-inside: avoid; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Inventory Management Report</h1>
          <p>Generated on ${new Date().toLocaleString()}</p>
          <p>Total Products: ${products.length}</p>
        </div>

        <div class="filters">
          <h3>Applied Filters</h3>
          <div class="filters-grid">
            <div class="filter-item">
              <div class="filter-label">Tab Filter:</div>
              <div class="filter-value">${filters.activeTab}</div>
            </div>
            <div class="filter-item">
              <div class="filter-label">Category:</div>
              <div class="filter-value">${filters.selectedCategory}</div>
            </div>
            <div class="filter-item">
              <div class="filter-label">Search Term:</div>
              <div class="filter-value">${filters.searchTerm || "None"}</div>
            </div>
          </div>
        </div>

        <div class="summary">
          ${generateSummaryCards(products)}
        </div>

        <table>
          <thead>
            <tr>
              <th>Product Name</th>
              <th>Batch Number</th>
              <th>Code</th>
              <th>Category</th>
              <th>Subcategory</th>
              <th>Expiry Date</th>
              <th>Stock</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            ${products
              .map(
                (product) => `
              <tr>
                <td><strong>${product.name}</strong></td>
                <td>${product.batch_no}</td>
                <td>${product.code}</td>
                <td>${product.category}</td>
                <td>${product.subcategory}</td>
                <td class="expiry ${getExpiryClass(product.expiry_date)}">${
                  product.expiry_date
                }</td>
                <td class="stock ${getStockClass(product.stock)}">${
                  product.stock
                }</td>
                <td><span class="status ${product.status.toLowerCase()}">${
                  product.status
                }</span></td>
              </tr>
            `
              )
              .join("")}
          </tbody>
        </table>

        <div class="footer">
          <p>This report was generated automatically by the Inventory Management System</p>
          <p>For questions or support, please contact the system administrator</p>
        </div>
      </body>
    </html>
  `;

  // Create and download PDF
  const printWindow = window.open("", "_blank");
  if (printWindow) {
    printWindow.document.write(htmlContent);
    printWindow.document.close();

    // Wait for content to load, then print
    setTimeout(() => {
      printWindow.print();
      // Close the window after printing (optional)
      setTimeout(() => {
        printWindow.close();
      }, 1000);
    }, 500);
  }
};

const generateSummaryCards = (products: inventoryItem[]): string => {
  const totalProducts = products.length;
  const activeProducts = products.filter((p) => p.status === "Active").length;
  const inactiveProducts = products.filter(
    (p) => p.status === "Inactive"
  ).length;
  const lowStockProducts = products.filter(
    (p) => p.stock > 0 && p.stock <= 10
  ).length;
  const outOfStockProducts = products.filter((p) => p.stock === 0).length;
  const expiredProducts = products.filter((p) => {
    const expiryDate = new Date(p.expiry_date.split("/").reverse().join("-"));
    return expiryDate < new Date();
  }).length;

  return `
    <div class="summary-card">
      <h4>Total Products</h4>
      <p class="number">${totalProducts}</p>
    </div>
    <div class="summary-card">
      <h4>Active Products</h4>
      <p class="number">${activeProducts}</p>
    </div>
    <div class="summary-card">
      <h4>Inactive Products</h4>
      <p class="number">${inactiveProducts}</p>
    </div>
    <div class="summary-card">
      <h4>Low Stock</h4>
      <p class="number">${lowStockProducts}</p>
    </div>
    <div class="summary-card">
      <h4>Out of Stock</h4>
      <p class="number">${outOfStockProducts}</p>
    </div>
    <div class="summary-card">
      <h4>Expired</h4>
      <p class="number">${expiredProducts}</p>
    </div>
  `;
};

const getStockClass = (stock: number): string => {
  if (stock === 0) return "out";
  if (stock <= 10) return "low";
  return "good";
};

const getExpiryClass = (expiryDate: string): string => {
  const expiry = new Date(expiryDate.split("/").reverse().join("-"));
  const today = new Date();
  const thirtyDaysFromNow = new Date();
  thirtyDaysFromNow.setDate(today.getDate() + 30);

  if (expiry < today) return "expired";
  if (expiry <= thirtyDaysFromNow) return "warning";
  return "";
};

// Alternative function using jsPDF library (if you prefer a proper PDF library)
export const generateInventoryPDFWithLibrary = async (
  products: inventoryItem[],
  filters: {
    searchTerm: string;
    selectedCategory: string;
    activeTab: string;
  }
) => {
  // This function would use jsPDF library
  // You would need to install: npm install jspdf jspdf-autotable
  //
  // import jsPDF from 'jspdf';
  // import 'jspdf-autotable';
  //
  // const doc = new jsPDF();
  // ... PDF generation logic using jsPDF
  // doc.save('inventory-report.pdf');

  console.log(
    "For jsPDF implementation, install jspdf and jspdf-autotable packages"
  );
};
