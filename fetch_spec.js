import axios from 'axios';
import fs from 'fs';

async function fetchSpec() {
    const token = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiI1IiwianRpIjoiYjE5MzFhZjdhMzY1NzI3YmMyYWIxYmVmMDVhMzVkYzM3MmY1Njk2NjY5MzU3OGRlYjEwZjg1OTE5MmNjNDhkZGQ2ZTE3MGNkMDNkODAzMjkiLCJpYXQiOjE3NzE3OTIyNjEuOTk1MjYzLCJuYmYiOjE3NzE3OTIyNjEuOTk1MjY1LCJleHAiOjE4MDMyNjUyMDAuMDA0MjUzLCJzdWIiOiI1NzYxIiwic2NvcGVzIjpbImludGVncmFjYW8iXX0.k-TPY21xekFRxvFU_vbXux_aBh5MRoFAuzdkigCyPJDHVh27J9DvvZqG_3Lnr3QhPvXAx4AmI9dk_DDxQtM_Uw6F0LEaqeUBsK5kTtnkuKodqnIfCG5vbKzvqztoAyn7yV0uLPS_Bk7UTSIxAKdHfwX0zrV1vA9qKppne3OsaifKvhTCfkEacJHPTC4zXhqN1IgyIczW6MNOy5U654NRYgOZzvr-Ajx7BS_8bLnVbn0cfQxnD5bKS_KGtmEgy4NR-tLZZPh2u3c4T2rhuK7KtZ7OUW54gYefwd77oQvGh-HRm_xAVsLPJ3XhvoWr_zf8av1nom7w_2YO9Ne_roSkZFSZrcOozeVXipNHPD91Zp52oBLmN6RPmAUN5iECXNEY8zUSMJKZ-e26o4IXBed1wPg8H1-tS64nd3w2v2yZLGQJLKTiXFsu6tfyxAmn7ZwGZ8YlTsRtG_PixEubTK2CI2flWsBuju8wBWNTMKYc7bI1UY0zJYAWlNfXfGdEj0s5qNT0DCLCr4c4OfWNjkx_1sMWXnFcPVIRjKohHS0agZU8LXJVsqVvsH5pO5jy2YorgmjXoV0jG_nPd29HL_4vugR91ABbF4bpU1suGPGCefuZUmE0x3UpAWh7TZ5RiExUclJLZE--NIEFRYvWv1E-_zjDzW2sjxwkAWDT2fEK6Qw';
    const url = 'https://service.certcontrol.com.br/docs/api.openapi';

    try {
        const response = await axios.get(url, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        fs.writeFileSync('certcontrol_spec.json', JSON.stringify(response.data, null, 2));
        console.log('Spec saved to certcontrol_spec.json');
    } catch (error) {
        console.error('Error fetching spec:', error.response ? error.response.status : error.message);
        if (error.response) console.log(JSON.stringify(error.response.data, null, 2));
    }
}

fetchSpec();
