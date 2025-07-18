'use client';

import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Icon } from '@iconify/react';
import Flag from 'react-flagkit';
import { SERVICE_NAME_MAP, SIMPLE_ICONS_MAP } from '@/data/services';

export const COUNTRY_ID_TO_ISO: Record<string, string> = {
  '0': 'RU', // Russia
  '1': 'UA', // Ukraine
  '2': 'KZ', // Kazakhstan
  '3': 'CN', // China
  '4': 'PH', // Philippines
  '5': 'MM', // Myanmar
  '6': 'ID', // Indonesia
  '7': 'MY', // Malaysia
  '8': 'KE', // Kenya
  '9': 'TZ', // Tanzania
  '10': 'VN', // Vietnam
  '11': 'KG', // Kyrgyzstan
  '12': 'UN', // [Missing, placeholder]
  '13': 'IL', // Israel
  '14': 'HK', // Hong Kong
  '15': 'PL', // Poland
  '16': 'GB', // United Kingdom
  '17': 'MG', // Madagascar
  '18': 'CD', // DR Congo
  '19': 'NG', // Nigeria
  '20': 'MO', // Macao
  '21': 'EG', // Egypt
  '22': 'IN', // India
  '23': 'IE', // Ireland
  '24': 'KH', // Cambodia
  '25': 'LA', // Laos
  '26': 'HT', // Haiti
  '27': 'CI', // Ivory Coast
  '28': 'GM', // Gambia
  '29': 'RS', // Serbia
  '30': 'YE', // Yemen
  '31': 'ZA', // South Africa
  '32': 'RO', // Romania
  '33': 'CO', // Colombia
  '34': 'EE', // Estonia
  '35': 'AZ', // Azerbaijan
  '36': 'CA', // Canada
  '37': 'MA', // Morocco
  '38': 'GH', // Ghana
  '39': 'AR', // Argentina
  '40': 'UZ', // Uzbekistan
  '41': 'CM', // Cameroon
  '42': 'TD', // Chad
  '43': 'DE', // Germany
  '44': 'LT', // Lithuania
  '45': 'HR', // Croatia
  '46': 'SE', // Sweden
  '47': 'IQ', // Iraq
  '48': 'NL', // Netherlands
  '49': 'LV', // Latvia
  '50': 'AT', // Austria
  '51': 'BY', // Belarus
  '52': 'TH', // Thailand
  '53': 'SA', // Saudi Arabia
  '54': 'MX', // Mexico
  '55': 'TW', // Taiwan
  '56': 'ES', // Spain
  '57': 'IR', // Iran
  '58': 'DZ', // Algeria
  '59': 'SI', // Slovenia
  '60': 'BD', // Bangladesh
  '61': 'SN', // Senegal
  '62': 'TR', // Turkey
  '63': 'CZ', // Czech Republic
  '64': 'LK', // Sri Lanka
  '65': 'PE', // Peru
  '66': 'PK', // Pakistan
  '67': 'NZ', // New Zealand
  '68': 'GN', // Guinea
  '69': 'ML', // Mali
  '70': 'VE', // Venezuela
  '71': 'ET', // Ethiopia
  '72': 'MN', // Mongolia
  '73': 'BR', // Brazil
  '74': 'AF', // Afghanistan
  '75': 'UG', // Uganda
  '76': 'AO', // Angola
  '77': 'CY', // Cyprus
  '78': 'FR', // France
  '79': 'PG', // Papua New Guinea
  '80': 'MZ', // Mozambique
  '81': 'NP', // Nepal
  '82': 'BE', // Belgium
  '83': 'BG', // Bulgaria
  '84': 'HU', // Hungary
  '85': 'MD', // Moldova
  '86': 'IT', // Italy
  '87': 'PY', // Paraguay
  '88': 'HN', // Honduras
  '89': 'TN', // Tunisia
  '90': 'NI', // Nicaragua
  '91': 'TL', // Timor-Leste
  '92': 'BO', // Bolivia
  '93': 'CR', // Costa Rica
  '94': 'GT', // Guatemala
  '95': 'AE', // UAE
  '96': 'ZW', // Zimbabwe
  '97': 'PR', // Puerto Rico
  '98': 'SD', // Sudan
  '99': 'TG', // Togo
  '100': 'KW', // Kuwait
  '101': 'SV', // El Salvador
  '102': 'LY', // Libya
  '103': 'JM', // Jamaica
  '104': 'TT', // Trinidad and Tobago
  '105': 'EC', // Ecuador
  '106': 'SZ', // Eswatini
  '107': 'OM', // Oman
  '108': 'BA', // Bosnia and Herzegovina
  '109': 'DO', // Dominican Republic
  '110': 'SY', // Syria
  '111': 'QA', // Qatar
  '112': 'PA', // Panama
  '113': 'CU', // Cuba
  '114': 'MR', // Mauritania
  '115': 'SL', // Sierra Leone
  '116': 'JO', // Jordan
  '117': 'PT', // Portugal
  '118': 'BB', // Barbados
  '119': 'BI', // Burundi
  '120': 'BJ', // Benin
  '121': 'BN', // Brunei
  '122': 'BS', // Bahamas
  '123': 'BW', // Botswana
  '124': 'BZ', // Belize
  '125': 'CF', // Central African Republic
  '126': 'DM', // Dominica
  '127': 'GD', // Grenada
  '128': 'GE', // Georgia
  '129': 'GR', // Greece
  '130': 'GW', // Guinea-Bissau
  '131': 'GY', // Guyana
  '132': 'IS', // Iceland
  '133': 'KM', // Comoros
  '134': 'KN', // Saint Kitts and Nevis
  '135': 'LR', // Liberia
  '136': 'LS', // Lesotho
  '137': 'MW', // Malawi
  '138': 'NA', // Namibia
  '139': 'NE', // Niger
  '140': 'RW', // Rwanda
  '141': 'SK', // Slovakia
  '142': 'SR', // Suriname
  '143': 'TJ', // Tajikistan
  '144': 'MC', // Monaco
  '145': 'BH', // Bahrain
  '146': 'RE', // Reunion
  '147': 'ZM', // Zambia
  '148': 'AM', // Armenia
  '149': 'SO', // Somalia
  '150': 'CG', // Congo
  '151': 'CL', // Chile
  '152': 'BF', // Burkina Faso
  '153': 'LB', // Lebanon
  '154': 'GA', // Gabon
  '155': 'AL', // Albania
  '156': 'UY', // Uruguay
  '157': 'MU', // Mauritius
  '158': 'BT', // Bhutan
  '159': 'MV', // Maldives
  '160': 'GP', // Guadeloupe
  '161': 'TM', // Turkmenistan
  '162': 'GF', // French Guiana
  '163': 'FI', // Finland
  '164': 'LC', // Saint Lucia
  '165': 'LU', // Luxembourg
  '166': 'VC', // Saint Vincent and the Grenadines
  '167': 'GQ', // Equatorial Guinea
  '168': 'DJ', // Djibouti
  '169': 'AG', // Antigua and Barbuda
  '170': 'KY', // Cayman Islands
  '171': 'ME', // Montenegro
  '172': 'DK', // Denmark
  '173': 'CH', // Switzerland
  '174': 'NO', // Norway
  '175': 'AU', // Australia
  '176': 'ER', // Eritrea
  '177': 'SS', // South Sudan
  '178': 'ST', // Sao Tome and Principe
  '179': 'AW', // Aruba
  '180': 'MS', // Montserrat
  '181': 'AI', // Anguilla
  '182': 'JP', // Japan
  '183': 'MK', // North Macedonia
  '184': 'SC', // Seychelles
  '185': 'NC', // New Caledonia
  '186': 'CV', // Cape Verde
  '187': 'US', // USA
  '188': 'PS', // Palestine
  '189': 'FJ', // Fiji
  '190': 'UN', // [Missing]
  '191': 'UN', // [Missing]
  '192': 'UN', // [Missing]
  '193': 'UN', // [Missing]
  '194': 'UN', // [Missing]
  '195': 'UN', // [Missing]
  '196': 'UN', // [Missing]
  '197': 'UN', // [Missing]
  '198': 'UN', // [Missing]
  '199': 'MT', // Malta
  '200': 'UN', // [Missing]
  '201': 'GI', // Gibraltar
  '202': 'UN', // [Missing]
  '203': 'XK', // Kosovo
  '204': 'NU', // Niue
};

export interface ServiceListProps {
  services: string[];
  prices: Array<{ service: string; country: string; priceBrl: number; priceUsd: number }>;
  userBalance: number;
  handlePurchase: (service: string, countryId: string) => void;
  countryMap: Record<string, string>;
}

export function ServiceList({ services, prices, userBalance, handlePurchase, countryMap }: ServiceListProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
      {services.map((service) => {
        const servicePrices = prices.filter((item) => item.country === service); // Filter by service code
        console.log(`Service: ${service}, Filtered Prices:`, servicePrices.map((p) => ({ service: p.service, country: p.country })));

        return (
          <DropdownMenu key={service}>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="flex items-center space-x-2">
                <Icon icon={SIMPLE_ICONS_MAP[service] || 'simple-icons:web'} className="h-5 w-5" />
                <span>{SERVICE_NAME_MAP[service] || service.toUpperCase()}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-80">
              {servicePrices.length > 0 ? (
                servicePrices.map((item) => {
                  const countryName = countryMap[item.service] || `(${item.service})`;
                  const countryIso2 = COUNTRY_ID_TO_ISO[item.service] || 'UN';
                  if (!countryMap[item.service]) {
                    console.warn(`Missing country name for ID: ${item.service}`);
                  }
                  return (
                    <DropdownMenuItem key={`${item.service}-${item.country}`} className="flex justify-between items-center">
                      <span className="flex items-center space-x-2">
                        <Flag country={countryIso2} size={20} />
                        <span>
                          {countryName} - {item.priceBrl.toFixed(2)} Créditos
                        </span>
                      </span>
                      <Button
                        size="sm"
                        onClick={() => handlePurchase(item.country, item.service)}
                        disabled={userBalance < item.priceBrl}
                      >
                        Comprar
                      </Button>
                    </DropdownMenuItem>
                  );
                })
              ) : (
                <DropdownMenuItem>Nenhum país disponível para {SERVICE_NAME_MAP[service] || service.toUpperCase()}</DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        );
      })}
    </div>
  );
}