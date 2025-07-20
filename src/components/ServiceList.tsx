'use client';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Icon } from '@iconify/react';
import { SERVICE_NAME_MAP, SIMPLE_ICONS_MAP } from '@/data/services';
import { useState, useMemo } from 'react';
import { FixedSizeList as List } from 'react-window';
import { PurchaseModal } from './PurchaseModal';
import Image from 'next/image';

export const COUNTRY_ID_TO_ISO: Record<string, string> = {
  '0': 'RU',
  '1': 'UA',
  '2': 'KZ',
  '3': 'CN',
  '4': 'PH',
  '5': 'MM',
  '6': 'ID',
  '7': 'MY',
  '8': 'KE',
  '9': 'TZ',
  '10': 'VN',
  '11': 'KG',
  '12': 'UN',
  '13': 'IL',
  '14': 'HK',
  '15': 'PL',
  '16': 'GB',
  '17': 'MG',
  '18': 'CD',
  '19': 'NG',
  '20': 'MO',
  '21': 'EG',
  '22': 'IN',
  '23': 'IE',
  '24': 'KH',
  '25': 'LA',
  '26': 'HT',
  '27': 'CI',
  '28': 'GM',
  '29': 'RS',
  '30': 'YE',
  '31': 'ZA',
  '32': 'RO',
  '33': 'CO',
  '34': 'EE',
  '35': 'AZ',
  '36': 'CA',
  '37': 'MA',
  '38': 'GH',
  '39': 'AR',
  '40': 'UZ',
  '41': 'CM',
  '42': 'TD',
  '43': 'DE',
  '44': 'LT',
  '45': 'HR',
  '46': 'SE',
  '47': 'IQ',
  '48': 'NL',
  '49': 'LV',
  '50': 'AT',
  '51': 'BY',
  '52': 'TH',
  '53': 'SA',
  '54': 'MX',
  '55': 'TW',
  '56': 'ES',
  '57': 'IR',
  '58': 'DZ',
  '59': 'SI',
  '60': 'BD',
  '61': 'SN',
  '62': 'TR',
  '63': 'CZ',
  '64': 'LK',
  '65': 'PE',
  '66': 'PK',
  '67': 'NZ',
  '68': 'GN',
  '69': 'ML',
  '70': 'VE',
  '71': 'ET',
  '72': 'MN',
  '73': 'BR',
  '74': 'AF',
  '75': 'UG',
  '76': 'AO',
  '77': 'CY',
  '78': 'FR',
  '79': 'PG',
  '80': 'MZ',
  '81': 'NP',
  '82': 'BE',
  '83': 'BG',
  '84': 'HU',
  '85': 'MD',
  '86': 'IT',
  '87': 'PY',
  '88': 'HN',
  '89': 'TN',
  '90': 'NI',
  '91': 'TL',
  '92': 'BO',
  '93': 'CR',
  '94': 'GT',
  '95': 'AE',
  '96': 'ZW',
  '97': 'PR',
  '98': 'SD',
  '99': 'TG',
  '100': 'KW',
  '101': 'SV',
  '102': 'LY',
  '103': 'JM',
  '104': 'TT',
  '105': 'EC',
  '106': 'SZ',
  '107': 'OM',
  '108': 'BA',
  '109': 'DO',
  '110': 'SY',
  '111': 'QA',
  '112': 'PA',
  '113': 'CU',
  '114': 'MR',
  '115': 'SL',
  '116': 'JO',
  '117': 'PT',
  '118': 'BB',
  '119': 'BI',
  '120': 'BJ',
  '121': 'BN',
  '122': 'BS',
  '123': 'BW',
  '124': 'BZ',
  '125': 'CF',
  '126': 'DM',
  '127': 'GD',
  '128': 'GE',
  '129': 'GR',
  '130': 'GW',
  '131': 'GY',
  '132': 'IS',
  '133': 'KM',
  '134': 'KN',
  '135': 'LR',
  '136': 'LS',
  '137': 'MW',
  '138': 'NA',
  '139': 'NE',
  '140': 'RW',
  '141': 'SK',
  '142': 'SR',
  '143': 'TJ',
  '144': 'MC',
  '145': 'BH',
  '146': 'RE',
  '147': 'ZM',
  '148': 'AM',
  '149': 'SO',
  '150': 'CG',
  '151': 'CL',
  '152': 'BF',
  '153': 'LB',
  '154': 'GA',
  '155': 'AL',
  '156': 'UY',
  '157': 'MU',
  '158': 'BT',
  '159': 'MV',
  '160': 'GP',
  '161': 'TM',
  '162': 'GF',
  '163': 'FI',
  '164': 'LC',
  '165': 'LU',
  '166': 'VC',
  '167': 'GQ',
  '168': 'DJ',
  '169': 'AG',
  '170': 'KY',
  '171': 'ME',
  '172': 'DK',
  '173': 'CH',
  '174': 'NO',
  '175': 'AU',
  '176': 'ER',
  '177': 'SS',
  '178': 'ST',
  '179': 'AW',
  '180': 'MS',
  '181': 'AI',
  '182': 'JP',
  '183': 'MK',
  '184': 'SC',
  '185': 'NC',
  '186': 'CV',
  '187': 'US',
  '188': 'PS',
  '189': 'FJ',
  '190': 'UN',
  '191': 'UN',
  '192': 'UN',
  '193': 'UN',
  '194': 'UN',
  '195': 'UN',
  '196': 'UN',
  '197': 'UN',
  '198': 'UN',
  '199': 'MT',
  '200': 'UN',
  '201': 'GI',
  '202': 'UN',
  '203': 'XK',
  '204': 'NU',
};

export interface ServiceListProps {
  services: string[];
  prices: Array<{ service: string; country: string; priceBrl: number; priceUsd: number }>;
  userBalance: number;
  handlePurchase: (service: string, countryId: string) => Promise<{ activationId: string; phoneNumber: string; creditsSpent: number } | null>;
  countryMap: Record<string, string>;
}

export function ServiceList({
  services,
  prices,
  userBalance,
  handlePurchase,
  countryMap,
}: ServiceListProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [selectedCountryId, setSelectedCountryId] = useState<string | null>(null);
  const [selectedPriceBrl, setSelectedPriceBrl] = useState<number | null>(null);

  // Precompute service prices to avoid recalculating in render
  const servicePricesMap = useMemo(() => {
    const map: Record<string, Array<{ service: string; country: string; priceBrl: number; priceUsd: number }>> = {};
    services.forEach((service) => {
      const filtered = Array.from(
        new Map(
          prices
            .filter((item) => item.service === service)
            .map((item) => [`${item.service}-${item.country}`, item])
        ).values()
      );
      map[service] = filtered;
    });
    return map;
  }, [services, prices]);

  const openPurchaseModal = (service: string, countryId: string, priceBrl: number) => {
    setSelectedService(service);
    setSelectedCountryId(countryId);
    setSelectedPriceBrl(priceBrl);
    setModalOpen(true);
  };

  const Row = ({
    index,
    style,
    data,
  }: {
    index: number;
    style: React.CSSProperties;
    data: { service: string; prices: Array<{ service: string; country: string; priceBrl: number; priceUsd: number }> };
  }) => {
    const { service, prices } = data;
    const item = prices[index];
    const countryName = countryMap[item.country] || `(${item.country})`;
    const countryIso2 = COUNTRY_ID_TO_ISO[item.country] || 'UN';

    return (
      <DropdownMenuItem
        key={`${item.service}-${item.country}-${index}`}
        style={style}
        className="flex justify-between items-center"
      >
        <span className="flex items-center space-x-2">
          {countryIso2 !== 'UN' ? (
            <Image
              src={`https://flagcdn.com/16x12/${countryIso2.toLowerCase()}.png`}
              alt={countryName}
              width={16}
              height={12}
              className="inline-block"
            />
          ) : (
            <span className="w-4 h-3 inline-block bg-gray-200 rounded-sm" />
          )}
          <span>
            {countryName} - {item.priceBrl.toFixed(2)} Créditos
          </span>
        </span>
        <Button
          size="sm"
          onClick={() => openPurchaseModal(item.service, item.country, item.priceBrl)}
          disabled={userBalance < item.priceBrl}
        >
          Comprar
        </Button>
      </DropdownMenuItem>
    );
  };

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {services.map((service) => {
          const servicePrices = servicePricesMap[service] || [];

          return (
            <DropdownMenu key={service}>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="flex items-center space-x-2">
                  <Icon icon={SIMPLE_ICONS_MAP[service] || 'simple-icons:web'} className="h-5 w-5" />
                  <span>{SERVICE_NAME_MAP[service] || service.toUpperCase()}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-90 md:w-95 lg:w-100 xl:w-120 max-h-[400px] overflow-hidden">
                {servicePrices.length > 0 ? (
                  <List
                    height={400}
                    itemCount={servicePrices.length}
                    itemSize={40}
                    width="100%"
                    itemData={{ service, prices: servicePrices }}
                  >
                    {Row}
                  </List>
                ) : (
                  <DropdownMenuItem>
                    Nenhum país disponível para {SERVICE_NAME_MAP[service] || service.toUpperCase()}
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          );
        })}
      </div>
      {selectedService && selectedCountryId && selectedPriceBrl !== null && (
        <PurchaseModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          service={selectedService}
          countryId={selectedCountryId}
          priceBrl={selectedPriceBrl}
          userBalance={userBalance}
          handlePurchase={handlePurchase}
          countryMap={countryMap}
        />
      )}
    </>
  );
}