import { useState, useEffect } from 'react';
import { PackageOpen, Download } from 'lucide-react';
import api from '../utils/api';

const Invoices = () => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        const { data } = await api.get('/billing/invoices');
        setInvoices(data.invoices || []);
      } catch (err) {
        setError('Failed to load past invoices.');
      } finally {
        setLoading(false);
      }
    };
    fetchInvoices();
  }, []);

  if (loading) return <div className="flex justify-center h-full items-center">Loading invoices...</div>;

  return (
    <div className="glass-card overflow-hidden animate-slide-up max-w-7xl mx-auto">
      <div className="px-6 py-6 border-b border-gray-100/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white/50">
        <div>
          <h3 className="text-xl font-bold text-gray-900 font-display">Billing History</h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">View and download your past Stripe invoices.</p>
        </div>
      </div>
      
      {error && (
        <div className="p-4 mx-6 mt-6 bg-red-50/80 backdrop-blur text-red-700 border border-red-100 rounded-xl">
          {error}
        </div>
      )}

      {invoices.length === 0 && !error ? (
        <div className="text-center py-20 px-4 sm:px-6 lg:px-8 border-t border-gray-100/50">
          <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 shadow-inner">
            <PackageOpen className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-base font-semibold text-gray-900">No invoices</h3>
          <p className="mt-2 text-sm text-gray-500 max-w-sm mx-auto">You don't have any billing history to display yet. Invoices will appear here once you subscribe to a plan.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-100">
            <thead className="bg-gray-50/80 backdrop-blur-sm">
              <tr>
                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="bg-white/40 divide-y divide-gray-100/50">
              {invoices.map((invoice, index) => (
                <tr key={invoice._id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 font-medium">
                    {new Date(invoice.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-bold">
                    {new Intl.NumberFormat('en-US', { style: 'currency', currency: invoice.currency }).format(invoice.amount / 100)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`px-2.5 py-1 inline-flex text-xs font-bold rounded-md ${
                      invoice.status === 'paid' ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-yellow-100 text-yellow-700 border border-yellow-200'
                    }`}>
                      {invoice.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    {invoice.pdfUrl ? (
                      <a href={invoice.pdfUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center px-3 py-1.5 border border-gray-200 rounded-lg text-primary-600 bg-white hover:bg-gray-50 hover:border-gray-300 transition-all font-semibold shadow-sm">
                        <Download className="w-4 h-4 mr-1.5" /> PDF
                      </a>
                    ) : (
                      <span className="text-gray-400 italic">Processing</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Invoices;
