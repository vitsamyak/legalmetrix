import fs from 'fs';
import path from 'path';

const filesToUpdate = [
  'AnalyticsPage.tsx',
  'ProductsPage.tsx',
  'ComplianceResult.tsx',
  'InspectorDashboard.tsx',
  'InspectionDetail.tsx',
  'ReportsPage.tsx',
  'RulesPage.tsx',
  'InspectionHistory.tsx',
  'ReportPreview.tsx'
];

const dir = 'src/pages';

for (const file of filesToUpdate) {
  const filePath = path.join(dir, file);
  let content = fs.readFileSync(filePath, 'utf-8');
  
  // Ensure BrandedLoader is imported
  if (!content.includes('BrandedLoader')) {
    const importStatement = "import { BrandedLoader } from '../components/BrandedLoader';\n";
    // Find last import
    const lastImportIndex = content.lastIndexOf('import ');
    const newlineAfterImport = content.indexOf('\n', lastImportIndex);
    content = content.slice(0, newlineAfterImport + 1) + importStatement + content.slice(newlineAfterImport + 1);
  }

  // AnalyticsPage
  content = content.replace(
    /<div className="w-full h-full flex items-center justify-center text-content-muted">Loading chart data...<\/div>/g,
    '<BrandedLoader fullScreen={false} subMessage="Loading chart data..." />'
  );
  
  // ProductsPage
  content = content.replace(
    /<td colSpan=\{6\} className="px-6 py-8 text-center text-content-muted">Loading products...<\/td>/g,
    '<td colSpan={6} className="px-6 py-8"><BrandedLoader fullScreen={false} subMessage="Loading products..." /></td>'
  );

  // ComplianceResult
  content = content.replace(
    /return <div className="p-12 text-center text-content-muted">Loading results...<\/div>;/g,
    'return <BrandedLoader fullScreen={false} subMessage="Loading results..." />;'
  );
  
  // InspectorDashboard
  content = content.replace(
    /<div className="w-full h-full flex items-center justify-center text-content-muted">Loading...<\/div>/g,
    '<BrandedLoader fullScreen={false} subMessage="Loading..." />'
  );
  content = content.replace(
    /<td colSpan=\{6\} className="px-6 py-8 text-center text-content-muted">Loading inspections...<\/td>/g,
    '<td colSpan={6} className="px-6 py-8"><BrandedLoader fullScreen={false} subMessage="Loading inspections..." /></td>'
  );
  
  // InspectionDetail
  content = content.replace(
    /return <div className="p-12 text-center text-content-muted">Loading inspection details...<\/div>;/g,
    'return <BrandedLoader fullScreen={false} subMessage="Loading inspection details..." />;'
  );

  // ReportsPage
  content = content.replace(
    /<td colSpan=\{6\} className="px-6 py-8 text-center text-content-muted">Loading reports...<\/td>/g,
    '<td colSpan={6} className="px-6 py-8"><BrandedLoader fullScreen={false} subMessage="Loading reports..." /></td>'
  );

  // RulesPage
  content = content.replace(
    /<td colSpan=\{5\} className="px-6 py-8 text-center text-content-muted">Loading rules...<\/td>/g,
    '<td colSpan={5} className="px-6 py-8"><BrandedLoader fullScreen={false} subMessage="Loading rules..." /></td>'
  );
  
  // InspectionHistory
  content = content.replace(
    /<td colSpan=\{7\} className="px-6 py-8 text-center text-content-muted">Loading inspections...<\/td>/g,
    '<td colSpan={7} className="px-6 py-8"><BrandedLoader fullScreen={false} subMessage="Loading inspections..." /></td>'
  );

  // ReportPreview
  content = content.replace(
    /return <div className="p-12 text-center text-content-muted">Loading report...<\/div>;/g,
    'return <BrandedLoader fullScreen={false} subMessage="Loading report..." />;'
  );

  fs.writeFileSync(filePath, content);
  console.log(`Updated ${file}`);
}
