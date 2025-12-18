// 1. HIDUPKAN IKON (Lucide)
// Ini wajib supaya ikon <i data-lucide> boleh nampak
lucide.createIcons();

// 2. FUNGSI JAM DIGITAL
function kemaskiniJam() {
    const sekarang = new Date();

    // Format Masa: Contoh 14:05:33
    const teksMasa = sekarang.toLocaleTimeString('ms-MY', {
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });

    // Format Tarikh: Contoh 26 NOV 2025
    const teksTarikh = sekarang.toLocaleDateString('ms-MY', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
    }).toUpperCase();

    // Masukkan data ke dalam HTML (Guna ID Bahasa Melayu tadi)
    document.getElementById('jam-semasa').innerText = teksMasa;
    document.getElementById('tarikh-semasa').innerText = teksTarikh;
}

// Jalankan jam setiap 1 saat (1000ms)
setInterval(kemaskiniJam, 1000);
kemaskiniJam(); // Panggil sekali masa mula-mula load

// 3. TETAPAN CARTA (GRAF DONUT)
// Carta telah digantikan dengan CSS Pure untuk prestasi dan visual yang lebih baik.
// const konteksGraf = ... (Kod lama dibuang untuk elak ralat)

// 4. FUNGSI TUKAR TAB (LOGIK SPA - Single Page Application)
// idTab = Nama tab yang kita nak buka (contoh: 'laman-dashboard')
// elemen = Butang yang ditekan
function tukarTab(idTab, elemen) {

    // Halang link daripada reload page
    if (event) event.preventDefault();

    // A. URUSKAN SIDEBAR (MENU KIRI)
    // 1. Buang class 'navigasi-aktif' dari SEMUA menu dulu
    const semuaMenu = document.querySelectorAll('.item-navigasi');
    semuaMenu.forEach(item => {
        item.classList.remove('navigasi-aktif');
        item.classList.remove('text-white');
        item.classList.add('text-slate-300'); // Balik warna kelabu
    });

    // 2. Tambah class 'navigasi-aktif' pada menu yang DITEKAN
    if (elemen) {
        elemen.classList.add('navigasi-aktif');
        elemen.classList.remove('text-slate-300');
    } else {
        // Kalau fungsi dipanggil manual (bukan tekan menu), highlight menu pertama
        // Check if we are in admin page to not highlight dashboard blindly
        if (idTab === 'laman-kemaskini') {
            // No default highlight if programmatic switch to hidden menu
        } else {
            const defaultMenu = document.querySelectorAll('.item-navigasi')[0];
            if (defaultMenu) defaultMenu.classList.add('navigasi-aktif');
        }
    }

    // B. URUSKAN KANDUNGAN (TENGAH)
    const blokDashboard = document.getElementById('kandungan-dashboard');
    const blokKosong = document.getElementById('kandungan-kosong');
    const blokKalendar = document.getElementById('kandungan-kalendar');
    const blokDirektori = document.getElementById('kandungan-direktori');
    const blokKemaskini = document.getElementById('kandungan-kemaskini');
    const blokButiran = document.getElementById('kandungan-butiran');

    // Reset semua ke hidden dulu
    blokDashboard.classList.add('hidden');
    blokKosong.classList.add('hidden');
    blokKalendar.classList.add('hidden');
    if (blokDirektori) blokDirektori.classList.add('hidden');
    if (blokKemaskini) blokKemaskini.classList.add('hidden');
    if (blokButiran) blokButiran.classList.add('hidden');
    const blokStatistik = document.getElementById('kandungan-statistik');
    if (blokStatistik) blokStatistik.classList.add('hidden');

    if (idTab === 'laman-dashboard') {
        blokDashboard.classList.remove('hidden');
    } else if (idTab === 'laman-kalender') {
        blokKalendar.classList.remove('hidden');
    } else if (idTab === 'laman-statistik') {
        if (blokStatistik) {
            blokStatistik.classList.remove('hidden');
            if (typeof renderStatistik === 'function') {
                renderStatistik(); // Render bila tab dibuka
                initChartStatistik(); // Initialize chart explicitly when tab opens
            }
        }
    } else if (idTab === 'laman-direktori') {
        if (blokDirektori) {
            blokDirektori.classList.remove('hidden');
            if (inputCarian) inputCarian.value = '';
            dataSemasa = [...dataPegawai];
            renderDirektori();
        }
    } else if (idTab === 'laman-kemaskini') {
        // Keselamatan: Hanya Admin boleh akses
        if (currentUser && currentUser.role === 'admin') {
            if (blokKemaskini) {
                blokKemaskini.classList.remove('hidden');
                lucide.createIcons(); // Render ikon baru
            }
        } else {
            tunjukPopup('Akses Ditolak: Hanya Admin dibenarkan.');
            setTimeout(() => tukarTab('laman-dashboard', null), 100);
        }
    } else if (idTab === 'laman-butiran') {
        // Keselamatan: Hanya Admin boleh akses
        if (currentUser && currentUser.role === 'admin') {
            if (blokButiran) {
                blokButiran.classList.remove('hidden');
                lucide.createIcons(); // Render ikon baru
                // Reset view if needed
                const detailView = document.getElementById('paparan-butiran-pegawai');
                if (detailView) detailView.classList.add('hidden');
                const searchInput = document.getElementById('carian-butiran-input');
                if (searchInput) searchInput.value = '';
            }
        } else {
            tunjukPopup('Akses Ditolak: Hanya Admin dibenarkan.');
            // Balik ke dashboard
            setTimeout(() => tukarTab('laman-dashboard', null), 100);
        }
    } else {
        blokKosong.classList.remove('hidden');

        // Update tajuk halaman kosong
        const tajukHalaman = document.getElementById('tajuk-dinamik');
        let tajukBaru = "Halaman";
        switch (idTab) {
            case 'laman-notifikasi': tajukBaru = "Pusat Notifikasi"; break;
            // Statistik is now handled explicitly above, but keep as fallback if needed
        }
        if (tajukHalaman) tajukHalaman.innerText = tajukBaru;
    }
}

// 5. EVENT LISTENER: BUTANG "KEMBALI KE DASHBOARD"
// Bila orang tekan butang dalam page kosong, dia akan balik ke dashboard
document.getElementById('butang-kembali').addEventListener('click', function () {
    tukarTab('laman-dashboard', null);

    // Reset highlight menu kiri ke yang atas sekali
    const menu = document.querySelectorAll('.item-navigasi');
    menu.forEach(el => el.classList.remove('navigasi-aktif'));
    menu[0].classList.add('navigasi-aktif');
});

// 6. MODUL KALENDER - PAPARAN KEMAS UNTUK BULAN SEMASA
const tajukBulan = document.getElementById('tajuk-bulan');
const gridKalendar = document.getElementById('grid-kalendar');
const senaraiAcara = document.getElementById('senarai-acara');
const jumlahAcara = document.getElementById('jumlah-acara');
const butangSebelum = document.getElementById('bulan-sebelum');
const butangSeterusnya = document.getElementById('bulan-seterusnya');
const borangAcara = document.getElementById('borang-acara');
const butangEdit = document.getElementById('butang-edit');
const inputTarikh = document.getElementById('acara-tarikh');
const inputMasa = document.getElementById('acara-masa');
const inputTajuk = document.getElementById('acara-tajuk');
const inputLokasi = document.getElementById('acara-lokasi');
const popupBerjaya = document.getElementById('popup-berjaya');
const popupTeks = document.getElementById('popup-teks');
const popupKad = popupBerjaya ? popupBerjaya.querySelector('div') : null;

const senaraiAcaraDirancang = [
    { tarikh: '2025-11-04', tajuk: 'Sesi Onboarding Kakitangan Baru', lokasi: 'Bilik Latihan Aras 3', masa: '09:00 pagi' },
    { tarikh: '2025-11-07', tajuk: 'Pemeriksaan Keselamatan Tahunan', lokasi: 'Stor Peralatan', masa: '11:00 pagi' },
    { tarikh: '2025-11-13', tajuk: 'Audit Dalaman HR', lokasi: 'Bilik Mesyuarat Utama', masa: '02:30 petang' },
    { tarikh: '2025-11-20', tajuk: 'Bengkel Kepimpinan', lokasi: 'Pusat Latihan Serantau', masa: '08:30 pagi' },
    { tarikh: '2025-11-27', tajuk: 'Majlis Penghargaan Staf', lokasi: 'Dewan Serbaguna', masa: '04:00 petang' },
    { tarikh: '2025-12-05', tajuk: 'Hari Terbuka HR', lokasi: 'Auditorium', masa: '10:00 pagi' },
    { tarikh: '2025-12-12', tajuk: 'Perjumpaan Tahunan Jabatan', lokasi: 'Bilik Mesyuarat Utama', masa: '03:00 petang' },
];

// Mulakan kalendar pada bulan acara terawal supaya sorotan grid dan senarai sepadan
let tarikhFokus = senaraiAcaraDirancang.length
    ? new Date(senaraiAcaraDirancang[0].tarikh + 'T00:00:00')
    : new Date();
let tarikhDipilih = senaraiAcaraDirancang.length ? senaraiAcaraDirancang[0].tarikh : null;
let indeksSedangEdit = null;

if (inputTarikh) {
    const tahun = tarikhFokus.getFullYear();
    const bulan = String(tarikhFokus.getMonth() + 1).padStart(2, '0');
    const hari = String(tarikhFokus.getDate()).padStart(2, '0');
    inputTarikh.value = `${tahun}-${bulan}-${hari}`;
}

function formatTarikhRingkas(tarikhISO) {
    const tarikhObj = new Date(tarikhISO + 'T00:00:00');
    return tarikhObj.toLocaleDateString('ms-MY', { day: '2-digit', month: 'short' });
}

function normalisasiMasaKeInput(masaString) {
    if (!masaString) return '';
    const pad = (v) => String(v).padStart(2, '0');
    const padMinit = (min) => min && min.length === 1 ? `0${min}` : min;
    const padJam = (jam) => pad(jam);

    const regex = /(\d{1,2}):(\d{2})/;
    const padanan = masaString.match(regex);
    if (!padanan) return '';

    let jam = parseInt(padanan[1], 10);
    const minit = padMinit(padanan[2]);
    const teks = masaString.toLowerCase();

    if (teks.includes('pagi')) {
        if (jam === 12) jam = 0;
    } else if (teks.includes('tengahari')) {
        if (jam < 12) jam = 12;
    } else if (teks.includes('petang') || teks.includes('malam')) {
        if (jam < 12) jam += 12;
    }

    return `${padJam(jam)}:${minit}`;
}

function binaKalendar() {
    if (!gridKalendar || !tajukBulan) return;

    const tahun = tarikhFokus.getFullYear();
    const bulan = tarikhFokus.getMonth();
    const jumlahHari = new Date(tahun, bulan + 1, 0).getDate();
    const hariPertama = new Date(tahun, bulan, 1);
    const offsetMinggu = (hariPertama.getDay() + 6) % 7; // Tukar supaya Isnin = 0
    const hariIni = new Date();

    tajukBulan.innerText = tarikhFokus.toLocaleDateString('ms-MY', { month: 'long', year: 'numeric' });
    gridKalendar.innerHTML = '';

    for (let i = 0; i < offsetMinggu; i++) {
        const placeholder = document.createElement('div');
        placeholder.className = 'rounded-xl border border-dashed border-slate-100 min-h-[54px]';
        gridKalendar.appendChild(placeholder);
    }

    for (let hari = 1; hari <= jumlahHari; hari++) {
        const tarikhSemasa = new Date(tahun, bulan, hari);
        const tarikhISO = [
            tarikhSemasa.getFullYear(),
            String(tarikhSemasa.getMonth() + 1).padStart(2, '0'),
            String(tarikhSemasa.getDate()).padStart(2, '0')
        ].join('-'); // Elak isu zon masa ketika dibandingkan
        const acaraHariIni = senaraiAcaraDirancang.filter(item => item.tarikh === tarikhISO);
        const adalahHariIni = hariIni.toDateString() === tarikhSemasa.toDateString();

        const sel = document.createElement('div');
        sel.className = 'p-2.5 rounded-xl border text-center min-h-[54px] flex flex-col items-center justify-center border-slate-200 bg-white shadow-sm cursor-pointer';
        sel.dataset.tarikhHari = tarikhISO;

        if (acaraHariIni.length) {
            sel.classList.add('border-indigo-200', 'bg-indigo-50', 'text-indigo-700');
        }

        if (adalahHariIni) {
            sel.classList.remove('bg-indigo-50', 'text-indigo-700');
            sel.classList.add('border-indigo-500', 'ring-2', 'ring-indigo-400', 'text-slate-900');
        }

        const nomborHari = document.createElement('span');
        nomborHari.className = 'text-xl font-bold';
        nomborHari.innerText = hari;
        sel.appendChild(nomborHari);

        if (acaraHariIni.length) {
            const labelAcara = document.createElement('span');
            labelAcara.className = `mt-2 text-[11px] font-semibold uppercase tracking-widest ${adalahHariIni ? 'text-white/90' : 'text-indigo-700'}`;
            labelAcara.innerText = `${acaraHariIni.length} acara`;
            sel.appendChild(labelAcara);
        }

        sel.addEventListener('click', () => {
            tarikhDipilih = tarikhISO;
            if (inputTarikh) inputTarikh.value = tarikhISO;
            if (acaraHariIni.length) {
                const acaraPertama = acaraHariIni[0];
                indeksSedangEdit = senaraiAcaraDirancang.indexOf(acaraPertama);
                if (inputTajuk) inputTajuk.value = acaraPertama.tajuk;
                if (inputLokasi) inputLokasi.value = acaraPertama.lokasi;
                if (inputMasa) {
                    const nilaiMasa = /^\d{2}:\d{2}/.test(acaraPertama.masa) ? acaraPertama.masa.slice(0, 5) : normalisasiMasaKeInput(acaraPertama.masa);
                    inputMasa.value = nilaiMasa;
                }
            } else {
                indeksSedangEdit = null;
                if (inputTajuk) inputTajuk.value = '';
                if (inputLokasi) inputLokasi.value = '';
                if (inputMasa) inputMasa.value = '';
            }
            sorotKalendar(tarikhDipilih);
            sorotSenarai(tarikhDipilih, acaraHariIni.length > 0);
        });

        gridKalendar.appendChild(sel);
    }

    kemaskiniSenaraiAcara(tahun, bulan);
    sorotKalendar(tarikhDipilih);
}

function kemaskiniSenaraiAcara(tahun, bulan) {
    if (!senaraiAcara) return;

    const acaraBulan = senaraiAcaraDirancang.filter(item => {
        const tarikhItem = new Date(item.tarikh + 'T00:00:00');
        return tarikhItem.getFullYear() === tahun && tarikhItem.getMonth() === bulan;
    });

    senaraiAcara.innerHTML = '';

    if (acaraBulan.length === 0) {
        senaraiAcara.innerHTML = '<p class="text-sm text-slate-500">Tiada acara dijadualkan untuk bulan ini.</p>';
    } else {
        acaraBulan.forEach(acara => {
            const indeksAsal = senaraiAcaraDirancang.indexOf(acara);
            const blok = document.createElement('div');
            blok.className = 'p-4 border border-slate-100 rounded-xl hover:border-indigo-200 hover:bg-indigo-50/40 transition item-acara';
            blok.dataset.tarikhAcara = acara.tarikh;
            blok.innerHTML = `
                <div class="flex items-center justify-between mb-1">
                    <p class="font-semibold text-slate-800">${acara.tajuk}</p>
                    <span class="text-xs font-bold text-indigo-600">${formatTarikhRingkas(acara.tarikh)}</span>
                </div>
                <p class="text-sm text-slate-500">${acara.lokasi}</p>
                <p class="text-xs text-slate-400 mt-1">${acara.masa}</p>
            `;
            blok.addEventListener('click', () => {
                indeksSedangEdit = indeksAsal;
                tarikhDipilih = acara.tarikh;
                if (inputTarikh) inputTarikh.value = acara.tarikh;
                if (inputTajuk) inputTajuk.value = acara.tajuk;
                if (inputLokasi) inputLokasi.value = acara.lokasi;
                if (inputMasa) {
                    const nilaiMasa = /^\d{2}:\d{2}/.test(acara.masa) ? acara.masa.slice(0, 5) : normalisasiMasaKeInput(acara.masa);
                    inputMasa.value = nilaiMasa;
                }
                sorotKalendar(tarikhDipilih);
                sorotSenarai(tarikhDipilih, true);
            });
            senaraiAcara.appendChild(blok);
        });
    }

    if (jumlahAcara) {
        jumlahAcara.innerText = `${acaraBulan.length} ACARA`;
    }

    sorotSenarai(tarikhDipilih);
}

function sorotKalendar(tarikh) {
    const selHari = document.querySelectorAll('[data-tarikh-hari]');
    selHari.forEach(sel => {
        sel.classList.remove('ring-2', 'ring-indigo-400', 'border-indigo-300');
    });

    if (!tarikh) return;
    const aktif = document.querySelector(`[data-tarikh-hari="${tarikh}"]`);
    if (aktif) {
        aktif.classList.add('ring-2', 'ring-indigo-400', 'border-indigo-300');
    }
}

function sorotSenarai(tarikh, scrollKeItem = false) {
    const items = document.querySelectorAll('[data-tarikh-acara]');
    items.forEach(item => {
        item.classList.remove('ring-2', 'ring-indigo-400', 'bg-indigo-50', 'border-indigo-200');
    });

    if (!tarikh) return;

    const sasaran = Array.from(items).filter(el => el.dataset.tarikhAcara === tarikh);
    sasaran.forEach(el => {
        el.classList.add('ring-2', 'ring-indigo-400', 'bg-indigo-50', 'border-indigo-200');
        if (scrollKeItem) {
            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    });
}

if (gridKalendar && tajukBulan) {
    binaKalendar();

    if (butangSebelum) {
        butangSebelum.addEventListener('click', () => {
            tarikhFokus.setMonth(tarikhFokus.getMonth() - 1);
            binaKalendar();
        });
    }

    if (butangSeterusnya) {
        butangSeterusnya.addEventListener('click', () => {
            tarikhFokus.setMonth(tarikhFokus.getMonth() + 1);
            binaKalendar();
        });
    }
}

if (borangAcara) {
    borangAcara.addEventListener('submit', (e) => {
        e.preventDefault();

        const tarikh = (inputTarikh && inputTarikh.value) ? inputTarikh.value : '';
        const tajuk = (inputTajuk && inputTajuk.value.trim()) || '';
        const lokasi = (inputLokasi && inputLokasi.value.trim()) || '';
        const masa = (inputMasa && inputMasa.value) ? inputMasa.value : '';

        if (!tarikh || !tajuk || !lokasi || !masa) return;

        const acaraBaru = { tarikh, tajuk, lokasi, masa };
        senaraiAcaraDirancang.push(acaraBaru);
        senaraiAcaraDirancang.sort((a, b) => a.tarikh.localeCompare(b.tarikh));

        tarikhFokus = new Date(tarikh + 'T00:00:00');
        tarikhDipilih = tarikh;
        binaKalendar();

        borangAcara.reset();
        inputTarikh.value = tarikh;
        sorotSenarai(tarikhDipilih, true);
        indeksSedangEdit = senaraiAcaraDirancang.indexOf(acaraBaru);
        tunjukPopup('Acara berjaya ditambah.');
    });
}

if (butangEdit) {
    butangEdit.addEventListener('click', () => {
        if (indeksSedangEdit === null) {
            return;
        }

        const acaraSasaran = senaraiAcaraDirancang[indeksSedangEdit];
        const tarikh = acaraSasaran ? acaraSasaran.tarikh : (inputTarikh && inputTarikh.value) ? inputTarikh.value : '';

        senaraiAcaraDirancang.splice(indeksSedangEdit, 1);
        senaraiAcaraDirancang.sort((a, b) => a.tarikh.localeCompare(b.tarikh));
        indeksSedangEdit = null;

        tarikhFokus = tarikh ? new Date(tarikh + 'T00:00:00') : new Date();
        tarikhDipilih = tarikh;
        binaKalendar();
        sorotSenarai(tarikhDipilih, true);
        if (borangAcara) borangAcara.reset();
        if (inputTarikh && tarikh) inputTarikh.value = tarikh;
        tunjukPopup('Acara berjaya dipadam.');
    });
}

// Popup Elements
const popupIkonWadah = document.getElementById('popup-ikon-container');
const popupIkon = document.getElementById('popup-ikon');
const popupTajuk = document.getElementById('popup-tajuk');

function tunjukPopup(teks, jenis = 'positif') {
    if (!popupBerjaya || !popupTeks || !popupKad) return;

    popupTeks.innerText = teks;

    // Reset Classes
    popupIkonWadah.className = 'w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg transition-colors';
    popupIkon.innerHTML = ''; // Clear icon

    // Configure based on type
    if (jenis === 'positif') {
        popupTajuk.innerText = 'Berjaya';
        popupTajuk.className = 'text-lg font-semibold text-slate-900';
        popupIkonWadah.classList.add('bg-gradient-to-br', 'from-emerald-400/90', 'to-emerald-600', 'shadow-emerald-200');
        popupIkon.setAttribute('data-lucide', 'check-circle-2');
    } else {
        popupTajuk.innerText = 'Ralat';
        popupTajuk.className = 'text-lg font-semibold text-red-600';
        popupIkonWadah.classList.add('bg-gradient-to-br', 'from-red-400/90', 'to-red-600', 'shadow-red-200');
        popupIkon.setAttribute('data-lucide', 'x-circle');
    }

    // Refresh Icons
    lucide.createIcons();

    popupBerjaya.classList.remove('hidden');

    requestAnimationFrame(() => {
        if (popupKad) popupKad.classList.remove('opacity-0', 'translate-y-3', 'scale-95');
    });

    clearTimeout(tunjukPopup.jeda);
    tunjukPopup.jeda = setTimeout(() => {
        if (popupKad) popupKad.classList.add('opacity-0', 'translate-y-3', 'scale-95');
        setTimeout(() => popupBerjaya.classList.add('hidden'), 200);
    }, 2000); // Increased duration for readability
}

// 7. SISTEM LOG MASUK & KAWALAN AKSES
const modalLogin = document.getElementById('modal-login');
const profilPengguna = document.getElementById('profil-pengguna');
const tutupModal = document.getElementById('tutup-modal');
const borangLogin = document.getElementById('borang-login');
const ralatLogin = document.getElementById('ralat-login');
const menuAdmin = document.getElementById('menu-admin');
const namaPengguna = document.getElementById('nama-pengguna');
const labelJawatan = document.getElementById('label-jawatan');
const labelEmail = document.getElementById('label-email');
const headerUserIcon = document.getElementById('header-user-icon');

// Status Pengguna Semasa (Default: null = Tetamu)
let currentUser = null;

// Fungsi Buka/Tutup Modal
function toggleModal(tunjuk) {
    if (tunjuk) {
        modalLogin.classList.remove('hidden');
        // Render ikon dalam modal jika belum
        lucide.createIcons();
    } else {
        modalLogin.classList.add('hidden');
        ralatLogin.classList.add('hidden');
        borangLogin.reset();
    }
}

// Event Listeners
if (profilPengguna) {
    profilPengguna.addEventListener('click', () => {
        // Jika belum login, buka modal
        if (!currentUser) {
            toggleModal(true);
        } else {
            // Opsyen tambahan: Logout jika sudah login (boleh ditambah kemudian)
            if (confirm("Adakah anda ingin log keluar?")) {
                logout();
            }
        }
    });
}

if (tutupModal) {
    tutupModal.addEventListener('click', () => toggleModal(false));
}

// Tutup modal jika klik di luar kotak
if (modalLogin) {
    modalLogin.addEventListener('click', (e) => {
        if (e.target === modalLogin) toggleModal(false);
    });
}

// Logik Login
if (borangLogin) {
    borangLogin.addEventListener('submit', (e) => {
        e.preventDefault();

        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        // Semak Kelayakan (Dummy Data)
        if (username === 'sm' && password === '1') {
            loginBerjaya();
        } else {
            ralatLogin.classList.remove('hidden');
        }
    });
}

function loginBerjaya() {
    currentUser = {
        nama: 'Admin HR',
        email: 'sumberhq@doe.gov.my',
        role: 'admin'
    };

    updateUI();
    toggleModal(false);
    tunjukPopup('Log masuk berjaya!');
}

function logout() {
    currentUser = null;
    updateUI();
    tunjukPopup('Log keluar berjaya.');

    // Jika sedang di laman admin, balik ke dashboard
    tukarTab('laman-dashboard', null);
    const menu = document.querySelectorAll('.item-navigasi');
    menu.forEach(el => el.classList.remove('navigasi-aktif'));
    menu[0].classList.add('navigasi-aktif');
}

function updateUI() {
    if (currentUser && currentUser.role === 'admin') {
        // Paparan Admin
        menuAdmin.classList.remove('hidden');
        namaPengguna.innerText = "Admin HR";
        labelJawatan.innerText = "Admin HR";
        labelEmail.innerText = "sumberhq@doe.gov.my";
        if (headerUserIcon) headerUserIcon.innerText = "A";

        // Tukar style profil supaya nampak aktif
        profilPengguna.classList.add('bg-indigo-900/50');
        profilPengguna.classList.remove('bg-slate-900/50');
    } else {
        // Paparan Tetamu
        menuAdmin.classList.add('hidden');
        namaPengguna.innerText = "Tetamu";
        labelJawatan.innerText = "Tetamu";
        labelEmail.innerText = "Klik untuk Log Masuk";
        if (headerUserIcon) headerUserIcon.innerText = "T";

        // Reset style profil
        profilPengguna.classList.remove('bg-indigo-900/50');
        profilPengguna.classList.add('bg-slate-900/50');
    }
}

// 8. MODUL DIREKTORI PEGAWAI
const senaraiPegawai = document.getElementById('senarai-pegawai');

// Data Dummy Pegawai
const dataPegawai = [
    {
        nama: 'Ahmad bin Syawal',
        ic: '850101-14-5566',
        umur: 39,
        gred: 'C10',
        jawatan: 'Pegawai Kawalan',
        lokasi: 'HQ Putrajaya',
        tarikhLantik: '2010-03-15',
        kelayakan1: 'Ijazah Sarjana Muda Pentadbiran Awam',
        history: {
            'c9': { date: '2010-03-15', status: 'STANDARD' },
            'c10': { date: '2018-06-01', status: 'STANDARD' }
        }
    },
    {
        nama: 'Siti Sarah binti Osman',
        ic: '900505-10-5588',
        umur: 34,
        gred: 'C9',
        jawatan: 'Pegawai Kawalan',
        lokasi: 'JAS Negeri Selangor',
        tarikhLantik: '2015-08-01',
        kelayakan1: 'Ijazah Sarjana Muda Perakaunan',
        history: {
            'c9': { date: '2015-08-01', status: 'STANDARD' }
        }
    },
    {
        nama: 'Muthusamy a/l Karuppiah',
        ic: '780312-08-6677',
        umur: 46,
        gred: 'C12',
        jawatan: 'Jurutera Kanan',
        lokasi: 'JAS Negeri Perak',
        tarikhLantik: '2003-05-12',
        kelayakan1: 'Ijazah Sarjana Muda Kejuruteraan Awam',
        history: {
            'c9': { date: '2003-05-12', status: 'STANDARD' },
            'c10': { date: '2010-12-01', status: 'STANDARD' },
            'c12': { date: '2018-04-15', status: 'STANDARD' }
        }
    },
    {
        nama: 'Johan Bin Zolpa',
        ic: '691120-14-8899', // Updated IC to match Age 55
        umur: 55, // Updated Age for KP
        gred: 'JUSA A',
        jawatan: 'Ketua Pengarah',
        lokasi: 'HQ Putrajaya',
        tarikhLantik: '1994-01-20',
        kelayakan1: 'PhD Sains Alam Sekitar',
        history: {
            'c9': { date: '1994-01-20', status: 'STANDARD' },
            'c10': { date: '2000-03-01', status: 'STANDARD' },
            'c12': { date: '2006-05-15', status: 'STANDARD' },
            'c13': { date: '2011-01-01', status: 'STANDARD' },
            'c14': { date: '2015-06-01', status: 'STANDARD' },
            'jusa-c': { date: '2019-01-01', status: 'STANDARD' },
            'jusa-b': { date: '2022-01-01', status: 'STANDARD' },
            'jusa-a': { date: '2024-06-01', status: 'MEMANGKU' }
        }
    },
    {
        nama: 'Nurul Izzah binti Anwar',
        ic: '880808-07-7744',
        umur: 36,
        gred: 'C9',
        jawatan: 'Ketua Penolong Pengarah',
        lokasi: 'JAS W.P. Kuala Lumpur',
        tarikhLantik: '2012-09-01',
        kelayakan1: 'Sarjana Pengurusan Dasar',
        history: {
            'c9': { date: '2012-09-01', status: 'STANDARD' },
            'c10': { date: '2020-01-01', status: 'MEMANGKU' }
        }
    },
    {
        nama: 'David Teoh',
        ic: '820202-13-5522',
        umur: 42,
        gred: 'C12',
        jawatan: 'Pegawai Kanan',
        lokasi: 'HQ Putrajaya',
        tarikhLantik: '2006-07-15',
        kelayakan1: 'Ijazah Sarjana Muda Sains Komputer',
        history: {
            'c9': { date: '2006-07-15', status: 'STANDARD' },
            'c10': { date: '2013-11-20', status: 'STANDARD' },
            'c12': { date: '2021-03-01', status: 'FLEKSI' }
        }
    },
    {
        nama: 'Fatimah binti Abu Bakar',
        ic: '920415-03-8833',
        umur: 32,
        gred: 'C9',
        jawatan: 'Pegawai Kawalan',
        lokasi: 'JAS Negeri Johor',
        tarikhLantik: '2015-02-10',
        kelayakan1: 'Diploma Pentadbiran',
        history: {
            'c9': { date: '2015-02-10', status: 'STANDARD' }
        }
    },
    {
        nama: 'Ramasamy a/l Letchumanan',
        ic: '750606-08-9911',
        umur: 49,
        gred: 'C10',
        jawatan: 'Pegawai Kawalan Alam Sekitar',
        lokasi: 'HQ Putrajaya',
        tarikhLantik: '1998-04-01',
        kelayakan1: 'SPM',
        history: {
            'c9': { date: '1998-04-01', status: 'STANDARD' },
            'c10': { date: '2013-01-01', status: 'MEMANGKU' }
        }
    },
    {
        nama: 'Tan Mei Ling',
        ic: '980909-14-6655',
        umur: 26,
        gred: 'C9',
        jawatan: 'Pegawai Kawalan Alam Swkitar',
        lokasi: 'JAS Negeri Pulau Pinang',
        tarikhLantik: '2023-01-15',
        kelayakan1: 'Ijazah Sarjana Muda HR',
        history: {
            'c9': { date: '2023-01-15', status: 'STANDARD' }
        }
    },
    {
        nama: 'Zainal Abidin bin Hassan',
        ic: '680101-01-5544',
        umur: 56,
        gred: 'JUSA C',
        jawatan: 'Pengarah Bahagian',
        lokasi: 'HQ Putrajaya',
        tarikhLantik: '1992-06-01',
        kelayakan1: 'Sarjana Kejuruteraan Alam Sekitar',
        history: {
            'c9': { date: '1992-06-01', status: 'STANDARD' },
            'c10': { date: '1998-01-15', status: 'STANDARD' },
            'c12': { date: '2004-03-01', status: 'STANDARD' },
            'c13': { date: '2010-06-01', status: 'STANDARD' },
            'c14': { date: '2016-01-01', status: 'STANDARD' },
            'jusa-c': { date: '2021-01-01', status: 'MEMANGKU' }
        }
    }
];

// Variable untuk menyimpan data semasa (selepas filter)
let dataSemasa = [...dataPegawai];

function renderDirektori(data = dataPegawai) {
    if (!senaraiPegawai) return;

    senaraiPegawai.innerHTML = '';

    if (data.length === 0) {
        senaraiPegawai.innerHTML = `
            <tr>
                <td colspan="7" class="px-4 py-8 text-center text-slate-500">
                    Tiada rekod dijumpai.
                </td>
            </tr>
        `;
        return;
    }

    data.forEach((pegawai, index) => {
        const baris = document.createElement('tr');
        baris.className = 'hover:bg-slate-50 transition-colors group';

        // Logik Keselamatan No. IC
        let paparanIC = '';
        if (currentUser && currentUser.role === 'admin') {
            paparanIC = `<span class="font-mono text-slate-600 bg-slate-100 px-2 py-1 rounded">${pegawai.ic}</span>`;
        } else {
            paparanIC = `
                <div class="flex items-center gap-2 text-slate-400 italic" title="Sila log masuk untuk melihat">
                    <i data-lucide="lock" class="w-3 h-3"></i>
                    <span>Terkunci</span>
                </div>
            `;
        }

        baris.innerHTML = `
            <td class="px-4 py-3 text-slate-500">${index + 1}</td>
            <td class="px-4 py-3 font-medium text-slate-800">
                <div class="flex items-center gap-3">
                    <div class="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-bold">
                        ${pegawai.nama.charAt(0)}
                    </div>
                    ${pegawai.nama}
                </div>
            </td>
            <td class="px-4 py-3">${paparanIC}</td>
            <td class="px-4 py-3 text-center text-slate-600">${pegawai.umur}</td>
            <td class="px-4 py-3">
                <span class="px-2 py-1 rounded text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                    ${pegawai.gred}
                </span>
            </td>
            <td class="px-4 py-3 text-slate-600">${pegawai.jawatan}</td>
            <td class="px-4 py-3 text-slate-500 text-xs">${pegawai.lokasi}</td>
        `;

        senaraiPegawai.appendChild(baris);
    });

    // Render semula ikon kunci
    lucide.createIcons();
}

// 9. LOGIK CARIAN & FILTER
const butangFilter = document.getElementById('butang-filter');
const carianWrapper = document.getElementById('carian-wrapper');
const inputCarian = document.getElementById('input-carian-pegawai');
const butangDownloadExcel = document.getElementById('butang-download-excel');

// FUNGSI DOWNLOAD EXCEL
if (butangDownloadExcel) {
    butangDownloadExcel.addEventListener('click', () => {
        // 1. Semak jika library XLSX wujud
        if (typeof XLSX === 'undefined') {
            tunjukPopup('Ralat: Modul Excel tidak dimuatkan.');
            return;
        }

        // 2. Semak jika ada data
        if (!dataSemasa || dataSemasa.length === 0) {
            tunjukPopup('Tiada data untuk dimuat turun.');
            return;
        }

        // 3. Format Data untuk Excel (Buang column ID yang tak perlu, rename header)
        const dataUntukExcel = dataSemasa.map((pegawai, index) => {
            // Logik keselamatan: Hanya admin boleh lihat No. IC sebenar
            const icValue = (currentUser && currentUser.role === 'admin') ? pegawai.ic : "TERKUNCI";

            return {
                "Bil": index + 1,
                "Nama Pegawai": pegawai.nama,
                "No. Kad Pengenalan": icValue,
                "Umur": pegawai.umur,
                "Gred": pegawai.gred,
                "Jawatan": pegawai.jawatan,
                "Lokasi Bertugas": pegawai.lokasi
            };
        });

        // 4. Buat Workbook
        const worksheet = XLSX.utils.json_to_sheet(dataUntukExcel);

        // 5. Buat Workbook
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Direktori Pegawai");

        // 6. Tetapkan Lebar Column (Optional, untuk kemasan)
        const wscols = [
            { wch: 5 },  // Bil
            { wch: 30 }, // Nama
            { wch: 15 }, // IC
            { wch: 5 },  // Umur
            { wch: 10 }, // Gred
            { wch: 25 }, // Jawatan
            { wch: 25 }  // Lokasi
        ];
        worksheet['!cols'] = wscols;

        // 7. Simpan Fail
        XLSX.writeFile(workbook, "Direktori_Pegawai_JAS.xlsx");

        // 8. Tunjuk feedback
        tunjukPopup('Fail Excel berjaya dimuat turun.');
    });
}

if (butangFilter && carianWrapper) {
    butangFilter.addEventListener('click', () => {
        carianWrapper.classList.toggle('hidden');
        if (!carianWrapper.classList.contains('hidden')) {
            inputCarian.focus();
        }
    });
}

if (inputCarian) {
    inputCarian.addEventListener('input', (e) => {
        const kataKunci = e.target.value.toLowerCase();

        const hasilCarian = dataPegawai.filter(pegawai => {
            return pegawai.nama.toLowerCase().includes(kataKunci) ||
                pegawai.ic.includes(kataKunci) ||
                pegawai.jawatan.toLowerCase().includes(kataKunci) ||
                pegawai.lokasi.toLowerCase().includes(kataKunci) ||
                pegawai.gred.toLowerCase().includes(kataKunci);
        });

        dataSemasa = hasilCarian; // Simpan data yang difilter
        renderDirektori(hasilCarian);
    });
}

// 10. MODUL STATISTIK PERJAWATAN (STAFF)
const senaraiJabatanRaw = `
Pejabat Ketua Pengarah Alam Sekitar
Pejabat Timbalan Ketua Pengarah (Pembangunan)
Bahagian Air & Marin
Bahagian Bahan Berbahaya
Bahagian Komunikasi Strategik
Bahagian Penguatkuasa
Bahagian Penilaian
Bahagian Pentadbiran & Kewangan
Bahagian Teknologi Maklumat
Bahagian Udara
Unit Integriti
Institut Alam Sekitar Malaysia (EiMAS)
Jabatan Alam Sekitar Negeri Perlis
Jabatan Alam Sekitar Negeri Kedah
Jabatan Alam Sekitar Negeri Pulau Pinang
Jabatan Alam Sekitar Negeri Perak
Jabatan Alam Sekitar Negeri Selangor
Jabatan Alam Sekitar Negeri Sembilan
Jabatan Alam Sekitar Negeri Melaka
Jabatan Alam Sekitar Negeri Johor
Jabatan Alam Sekitar Negeri Pahang
Jabatan Alam Sekitar Negeri Terengganu
Jabatan Alam Sekitar Negeri Kelantan
Jabatan Alam Sekitar Negeri Sabah
Jabatan Alam Sekitar Negeri Sarawak
Jabatan Alam Sekitar W. P. Kuala Lumpur
Jabatan Alam Sekitar W.P. Labuan
Jabatan Alam Sekitar Cawangan Batu Pahat, Johor
Jabatan Alam Sekitar Cawangan Kluang, Johor
Jabatan Alam Sekitar Cawangan Muar, Johor
Jabatan Alam Sekitar Cawangan Pasir Gudang, Johor
Jabatan Alam Sekitar Cawangan Pengerang, Johor
Jabatan Alam Sekitar Cawangan Kulim, Kedah
Jabatan Alam Sekitar Cawangan Langkawi, Kedah
Jabatan Alam Sekitar Cawangan Sungai Petani, Kedah
Jabatan Alam Sekitar Cawangan Gua Musang, Kelantan
Jabatan Alam Sekitar Cawangan Kuala Pilah, Negeri Sembilan
Jabatan Alam Sekitar Cawangan Cameron Highlands, Pahang
Jabatan Alam Sekitar Cawangan Gebeng, Pahang
Jabatan Alam Sekitar Cawangan Rompin, Pahang
Jabatan Alam Sekitar Cawangan Temerloh, Pahang
Jabatan Alam Sekitar Cawangan Taiping, Perak
Jabatan Alam Sekitar Cawangan Teluk Intan, Perak
Jabatan Alam Sekitar Cawangan Bayan Lepas, Pulau Pinang
Jabatan Alam Sekitar Cawangan Bintulu, Sabah
Jabatan Alam Sekitar Cawangan Sipitang, Sabah
Jabatan Alam Sekitar Cawangan Tawau, Sabah
Jabatan Alam Sekitar Cawangan Miri, Sarawak
Jabatan Alam Sekitar Cawangan Sibu, Sarawak
Jabatan Alam Sekitar Cawangan Gombak, Selangor
Jabatan Alam Sekitar Cawangan Kajang, Selangor
Jabatan Alam Sekitar Cawangan Sabak Bernam, Selangor
Jabatan Alam Sekitar Cawangan Sepang, Selangor
Jabatan Alam Sekitar Cawangan Kemaman, Terengganu
Kementerian Kerja Raya Malaysia
`;

// Bersihkan data raw menjadi array
const senaraiJabatan = senaraiJabatanRaw.trim().split('\n').filter(item => item.trim() !== '');

// Generate Dummy Data
let dataStatistik = [];
let chartInstance = null;
let dataTelahDiGenerate = false;

function generateStatistikData() {
    if (dataTelahDiGenerate) return; // Elak generate baru setiap kali tekan tab

    dataStatistik = senaraiJabatan.map((nama, index) => {
        let min, max;
        // Penukaran nama kepada lowercase untuk matching
        const namaLower = nama.toLowerCase();

        // LOGIC STRICT:
        // 1. JABATAN NEGERI (Priority Paling Tinggi - Paling Ramai)
        if (namaLower.includes('negeri') && !namaLower.includes('cawangan')) {
            min = 100;
            max = 180;
        }
        // 2. IBU PEJABAT / BAHAGIAN / KEMENTERIAN (Sederhana)
        else if (namaLower.includes('bahagian') || namaLower.includes('pejabat') || namaLower.includes('kementerian') || namaLower.includes('institut') || namaLower.includes('unit')) {
            min = 50;
            max = 100;
        }
        // 3. CAWANGAN (Paling Sikit)
        else {
            // Default untuk 'Cawangan' dan lain-lain
            min = 15;
            max = 35;
        }

        // Random count dalam range yang ditetapkan
        const total = Math.floor(Math.random() * (max - min + 1)) + min;

        // Pecahan Jantina (40-60% Lelaki)
        const lelaki = Math.floor(total * (Math.random() * (0.6 - 0.4) + 0.4));
        const perempuan = total - lelaki;

        return {
            id: index + 1,
            nama: nama.trim(),
            total: total,
            lelaki: lelaki,
            perempuan: perempuan
        };
    });

    // Sort ikut total staff 
    dataStatistik.sort((a, b) => b.total - a.total);

    dataTelahDiGenerate = true;
}

function renderStatistik() {
    generateStatistikData();

    const tbody = document.getElementById('tabel-statistik-body');
    const statTotal = document.getElementById('stat-total-pegawai');
    const statLelaki = document.getElementById('stat-total-lelaki');
    const statPerempuan = document.getElementById('stat-total-perempuan');
    const senaraiAktiviti = document.getElementById('senarai-aktiviti-stat');

    // Update Filtered Data if search input exists
    const inputCarianStat = document.getElementById('carian-statistik');
    let dataPaparan = [...dataStatistik];

    if (inputCarianStat && inputCarianStat.value) {
        const keyword = inputCarianStat.value.toLowerCase();
        dataPaparan = dataStatistik.filter(item => item.nama.toLowerCase().includes(keyword));
    }

    // 1. Render Table
    if (tbody) {
        tbody.innerHTML = '';
        dataPaparan.forEach((item, idx) => {
            const tr = document.createElement('tr');
            tr.className = 'hover:bg-slate-50 transition-colors group border-b border-slate-50 last:border-0';

            const nisbah = (item.lelaki / item.perempuan).toFixed(1);

            tr.innerHTML = `
                <td class="px-4 py-3 text-slate-500 text-xs">${idx + 1}</td>
                <td class="px-4 py-3">
                    <div class="font-medium text-slate-800 text-sm">${item.nama}</div>
                </td>
                <td class="px-4 py-3 text-center font-bold text-slate-700">${item.total}</td>
                <td class="px-4 py-3 text-center text-blue-600 font-medium">${item.lelaki}</td>
                <td class="px-4 py-3 text-center text-pink-600 font-medium">${item.perempuan}</td>
                <td class="px-4 py-3 text-center text-xs text-slate-500">
                    ${nisbah} : 1
                </td>
            `;
            tbody.appendChild(tr);
        });

        // Re-init icon
        lucide.createIcons();
    }

    // 2. Render Cards Summary (Aggregated)
    if (statTotal && statLelaki && statPerempuan) {
        const totalAll = dataStatistik.reduce((sum, item) => sum + item.total, 0);
        const lAll = dataStatistik.reduce((sum, item) => sum + item.lelaki, 0);
        const pAll = dataStatistik.reduce((sum, item) => sum + item.perempuan, 0);

        statTotal.innerText = totalAll.toLocaleString();
        statLelaki.innerText = lAll.toLocaleString();
        statPerempuan.innerText = pAll.toLocaleString();
    }

    // 3. Render Chart - REMOVED from here to prevent re-animation on search
    // initChartStatistik();

    // 4. Render Sidebar "Warga JAS Terkini" removed

}

// Chart Configuration
let currentChartType = 'bar'; // Default

function initChartStatistik(type = currentChartType) {
    const ctx = document.getElementById('cartaStatistikUtama');
    if (!ctx) return;

    // Destroy old chart if exists
    if (chartInstance) {
        chartInstance.destroy();
    }

    currentChartType = type; // Update state

    // Ambil Top 10 untuk graf
    const topData = dataStatistik.slice(0, 10);
    // Custom label shortening logic
    const labels = topData.map(d => {
        let name = d.nama
            .replace('Jabatan Alam Sekitar', '')
            .replace('Bahagian', '')
            .replace('Negeri', '')
            .replace('Cawangan', '')
            .trim();
        return name.length > 25 ? name.substring(0, 25) + '...' : name;
    });
    const dataTotal = topData.map(d => d.total);

    // Create Gradient for BAR chart
    const gradientFill = ctx.getContext('2d').createLinearGradient(0, 0, 0, 400);
    gradientFill.addColorStop(0, '#6366f1'); // Indigo 500
    gradientFill.addColorStop(1, '#818cf8'); // Indigo 400

    // Datasets Configuration based on Type
    const datasets = [];
    if (type === 'line') {
        datasets.push({
            label: 'Jumlah Pegawai',
            data: dataTotal,
            borderColor: '#6366f1',
            backgroundColor: 'rgba(99, 102, 241, 0.1)', // Light Indigo
            borderWidth: 3,
            tension: 0.4, // Smooth curve
            fill: true,
            pointBackgroundColor: '#ffffff',
            pointBorderColor: '#6366f1',
            pointBorderWidth: 2,
            pointRadius: 4,
            pointHoverRadius: 6
        });
    } else {
        // Default BAR
        datasets.push({
            label: 'Jumlah Pegawai',
            data: dataTotal,
            backgroundColor: gradientFill,
            borderRadius: 8,
            borderSkipped: false,
            barPercentage: 0.6,
            categoryPercentage: 0.8
        });
    }

    chartInstance = new Chart(ctx, {
        type: type,
        data: {
            labels: labels,
            datasets: datasets
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    backgroundColor: 'rgba(15, 23, 42, 0.9)', // Slate 900
                    titleColor: '#f8fafc',
                    bodyColor: '#e2e8f0',
                    padding: 14,
                    cornerRadius: 12,
                    displayColors: false,
                    callbacks: {
                        title: (items) => topData[items[0].dataIndex].nama
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    border: {
                        display: false
                    },
                    grid: {
                        color: '#f1f5f9',
                        borderDash: [5, 5]
                    },
                    ticks: {
                        font: {
                            family: "'Poppins', sans-serif",
                            size: 11
                        },
                        color: '#64748b'
                    }
                },
                x: {
                    grid: {
                        display: false
                    },
                    border: {
                        display: false
                    },
                    ticks: {
                        font: {
                            family: "'Poppins', sans-serif",
                            size: 11
                        },
                        color: '#64748b',
                        maxRotation: 0,
                        autoSkip: false,
                        // Simple logic to wrap text
                        callback: function (val, index) {
                            const label = this.getLabelForValue(val);
                            if (label.length > 15) {
                                return label.split(' ').slice(0, 2).join(' ') + '...';
                            }
                            return label;
                        }
                    }
                }
            },
            animation: {
                duration: 800, // Faster animation for switch
                easing: 'easeOutQuart'
            }
        }
    });
}

// 11. CHART MENU DROPDOWN LOGIC
const btnFilterChart = document.getElementById('btn-filter-chart');
const menuFilterChart = document.getElementById('menu-filter-chart');
const optChartBar = document.getElementById('opt-chart-bar');
const optChartLine = document.getElementById('opt-chart-line');

if (btnFilterChart && menuFilterChart) {
    // Toggle Menu
    btnFilterChart.addEventListener('click', (e) => {
        e.stopPropagation();
        menuFilterChart.classList.toggle('hidden');
    });

    // Close when clicking outside
    document.addEventListener('click', (e) => {
        if (!menuFilterChart.contains(e.target) && !btnFilterChart.contains(e.target)) {
            menuFilterChart.classList.add('hidden');
        }
    });

    // Option: Bar Chart
    if (optChartBar) {
        optChartBar.addEventListener('click', () => {
            initChartStatistik('bar');
            menuFilterChart.classList.add('hidden');
        });
    }

    // Option: Line Chart
    if (optChartLine) {
        optChartLine.addEventListener('click', () => {
            initChartStatistik('line');
            menuFilterChart.classList.add('hidden');
        });
    }
}

// Event Listener untuk Search Statistik
const searchInputStat = document.getElementById('carian-statistik');
if (searchInputStat) {
    searchInputStat.addEventListener('input', () => {
        renderStatistik();
    });
}


// ==========================================
// 10. MODUL PENGEMASKINIAN (LOGIK BARU)
// ==========================================

const inputCarianProfil = document.getElementById('carian-kemaskini-profil');
const hasilCarianProfil = document.getElementById('hasil-carian-profil');
const inputCarianGred = document.getElementById('carian-kemaskini-gred');
const hasilCarianGred = document.getElementById('hasil-carian-gred');

// Form Fields (Profil)
const formPegawai = document.getElementById('form-data-pegawai');
// Update declarations
const inputNama = document.getElementById('input-nama-entry');
const inputKp = document.getElementById('input-kp-entry');
const inputJawatan = document.getElementById('input-jawatan');
const inputLokasiUpdate = document.getElementById('input-lokasi');
const inputTarikhLantik = document.getElementById('input-tarikh-lantik');
const inputKelayakan1 = document.getElementById('input-kelayakan-1');
const inputKelayakan2 = document.getElementById('input-kelayakan-2');
const inputKelayakan3 = document.getElementById('input-kelayakan-3');

// Form Fields (Gred)
const displayNamaGred = document.getElementById('display-nama-gred');
const displayKpGred = document.getElementById('display-kp-gred');

// Buttons
const btnHantarBaru = document.getElementById('btn-hantar-baru');
const btnKemaskini = document.getElementById('btn-kemaskini-profil');
const btnHapus = document.getElementById('btn-hapus-profil');
const btnKosongkan = document.getElementById('btn-kosongkan-borang');

const btnKemaskiniGred = document.getElementById('btn-kemaskini-gred');
const btnKosongkanGred = document.getElementById('btn-kosongkan-gred');

// State untuk pegawai yang sedang diedit
let pegawaiSedangDieditIndex = null;
let pegawaiSedangDieditGredIndex = null;

// Helper: Get Base Color Status
function getColorName(status) {
    if (status === 'KUP') return 'blue';
    if (status === 'FLEKSI') return 'amber';
    if (status === 'MEMANGKU') return 'emerald';
    return 'slate';
}

// Fungsi Generic untuk Carian Dropdown
function setupCarianDropdown(inputEl, resultEl, onSelectCallback) {
    if (!inputEl || !resultEl) return;

    inputEl.addEventListener('input', (e) => {
        const keyword = e.target.value.toLowerCase();
        resultEl.innerHTML = '';

        if (keyword.length < 1) {
            resultEl.classList.add('hidden');
            return;
        }

        const matches = dataPegawai.filter(p =>
            p.nama.toLowerCase().includes(keyword) ||
            p.ic.includes(keyword)
        );

        if (matches.length > 0) {
            resultEl.classList.remove('hidden');
            matches.forEach((pegawai) => {
                const item = document.createElement('div');
                item.className = 'px-4 py-3 hover:bg-indigo-50 cursor-pointer border-b border-slate-50 last:border-0 flex flex-col';
                item.innerHTML = `
                    <span class="font-medium text-slate-800 text-sm">${pegawai.nama}</span>
                    <span class="text-xs text-slate-500">${pegawai.ic} - ${pegawai.jawatan}</span>
                `;
                item.addEventListener('click', () => {
                    const realIndex = dataPegawai.indexOf(pegawai);
                    onSelectCallback(pegawai, realIndex);
                    inputEl.value = pegawai.nama;
                    resultEl.classList.add('hidden');
                });
                resultEl.appendChild(item);
            });
        } else {
            resultEl.classList.add('hidden');
        }
    });

    document.addEventListener('click', (e) => {
        if (!inputEl.contains(e.target) && !resultEl.contains(e.target)) {
            resultEl.classList.add('hidden');
        }
    });
}

// Setup Carian Profil
setupCarianDropdown(inputCarianProfil, hasilCarianProfil, (pegawai, index) => {
    isiBorangProfil(pegawai, index);
});

// Setup Carian Gred (Independent search as requested)
setupCarianDropdown(inputCarianGred, hasilCarianGred, (pegawai, index) => {
    isiBorangGred(pegawai, index);
});


function isiBorangProfil(pegawai, index) {
    pegawaiSedangDieditIndex = index;

    // Isi Profil
    inputNama.value = pegawai.nama;
    inputKp.value = pegawai.ic;
    inputJawatan.value = pegawai.jawatan;
    inputLokasiUpdate.value = pegawai.lokasi;
    inputTarikhLantik.value = pegawai.tarikhLantik || '';
    inputKelayakan1.value = pegawai.kelayakan1 || '';
    inputKelayakan2.value = pegawai.kelayakan2 || '';
    inputKelayakan3.value = pegawai.kelayakan3 || '';

    tunjukPopup('Profil pegawai dimuatkan.');
}

function isiBorangGred(pegawai, index) {
    pegawaiSedangDieditGredIndex = index;

    // 1. Isi Header Gred
    displayNamaGred.innerText = pegawai.nama;
    displayKpGred.innerText = pegawai.ic;
    displayNamaGred.classList.remove('text-slate-500');
    displayNamaGred.classList.add('text-slate-800', 'font-medium');

    // 2. Isi Data Sejarah Gred (jika ada, kalau tak kosongkan)
    const history = pegawai.history || {};

    // List array of grade IDs
    const gradeIds = ['c9', 'c10', 'c12', 'c13', 'c14', 'jusa-c', 'jusa-b', 'jusa-a'];

    // Update summary texts to default first
    updateSummary('KUP', '-');
    updateSummary('FLEKSI', '-');
    updateSummary('MEMANGKU', '-');

    // Store collected grades for summary
    const summaryData = {
        'KUP': [],
        'FLEKSI': [],
        'MEMANGKU': []
    };

    gradeIds.forEach(id => {
        // Date Input
        const dateInput = document.getElementById(`date-${id}`);
        if (dateInput) dateInput.value = history[id]?.date || '';

        // Status Toggles
        const container = dateInput ? dateInput.nextElementSibling : null;
        if (container) {
            const buttons = container.querySelectorAll('button');
            buttons.forEach(btn => {
                const statusType = btn.dataset.status;
                const baseColor = getColorName(statusType);

                // Reset style first
                btn.classList.remove(`bg-${baseColor}-500`, 'text-white');
                btn.classList.add(`text-${baseColor}-600`, `hover:bg-${baseColor}-50`);

                // Check if this status was active for this grade in history
                const historyStatus = history[id]?.status || '';
                if (historyStatus.includes(statusType)) {
                    btn.classList.remove(`text-${baseColor}-600`, `hover:bg-${baseColor}-50`);
                    btn.classList.add(`bg-${baseColor}-500`, 'text-white');

                    // Collect for Summary
                    const label = container.parentElement.querySelector('label').innerText;
                    summaryData[statusType].push(label);
                }
            });
        }
    });

    // Update Summary Boxes with collected data
    Object.keys(summaryData).forEach(type => {
        if (summaryData[type].length > 0) {
            updateSummary(type, summaryData[type].join(', '));
        }
    });

    tunjukPopup('Data gred pegawai dimuatkan.');
}

function kosongkanBorangProfil() {
    pegawaiSedangDieditIndex = null;
    formPegawai.reset();
    inputCarianProfil.value = '';
}

function kosongkanBorangGred() {
    pegawaiSedangDieditGredIndex = null;
    inputCarianGred.value = '';
    displayNamaGred.innerText = 'Pilih pegawai...';
    displayKpGred.innerText = '-';
    displayNamaGred.classList.add('text-slate-500');
    displayNamaGred.classList.remove('text-slate-800', 'font-medium');

    // Reset inputs
    const gradeIds = ['c9', 'c10', 'c12', 'c13', 'c14', 'jusa-c', 'jusa-b', 'jusa-a'];
    gradeIds.forEach(id => {
        const dateInput = document.getElementById(`date-${id}`);
        if (dateInput) dateInput.value = '';

        // Reset buttons
        const container = dateInput ? dateInput.nextElementSibling : null;
        if (container) {
            const buttons = container.querySelectorAll('button');
            buttons.forEach(btn => {
                const statusType = btn.dataset.status;
                const baseColor = getColorName(statusType);
                btn.classList.remove(`bg-${baseColor}-500`, 'text-white');
                btn.classList.add(`text-${baseColor}-600`, `hover:bg-${baseColor}-50`);
            });
        }
    });

    updateSummary('KUP', '-');
    updateSummary('FLEKSI', '-');
    updateSummary('MEMANGKU', '-');
}


// Event Listeners for Buttons



// Butang Actions

// 12. SISTEM POPUP PENGESAHAN (CUSTOM CONFIRMATION)
const modalConfirm = document.getElementById('modal-confirm');
const msgConfirm = document.getElementById('msg-confirm');
const btnBatalConfirm = document.getElementById('btn-batal-confirm');
const btnTeruskanConfirm = document.getElementById('btn-teruskan-confirm');
let actionToConfirm = null;

function tunjukConfirmation(mesej, action) {
    if (!modalConfirm) return;

    msgConfirm.innerHTML = mesej;
    actionToConfirm = action;

    // Tunjuk modal
    modalConfirm.classList.remove('hidden');
    lucide.createIcons();
}

function tutupConfirmation() {
    modalConfirm.classList.add('hidden');
    actionToConfirm = null;
}

if (btnBatalConfirm) {
    btnBatalConfirm.addEventListener('click', tutupConfirmation);
}

if (btnTeruskanConfirm) {
    btnTeruskanConfirm.addEventListener('click', () => {
        if (actionToConfirm) actionToConfirm();
        tutupConfirmation();
    });
}
// Tutup jika klik luar
if (modalConfirm) {
    modalConfirm.addEventListener('click', (e) => {
        if (e.target === modalConfirm) tutupConfirmation();
    });
}


// Event Listeners for Buttons with Confirmation

if (btnKosongkan) btnKosongkan.addEventListener('click', kosongkanBorangProfil);

if (btnHantarBaru) {
    btnHantarBaru.addEventListener('click', (e) => {
        e.preventDefault();

        // Ambil nilai fresh dari DOM untuk mengelakkan isu reference
        const elNama = document.getElementById('input-nama-entry');
        const elKp = document.getElementById('input-kp-entry');

        const valNama = elNama ? elNama.value.trim() : '';
        const valKp = elKp ? elKp.value.trim() : '';

        // Validasi Ringkas
        if (!valNama || !valKp) {
            tunjukPopup('Sila isi Nama dan No. KP sekurang-kurangnya.', 'negatif');
            return;
        }

        // Semakan Duplikasi No. KP
        const isDuplicate = dataPegawai.some(p => p.ic === valKp);
        if (isDuplicate) {
            tunjukPopup('Pendaftaran Gagal: No. KP ini telah wujud dalam pangkalan data.', 'negatif');
            return;
        }

        tunjukConfirmation(
            "Adakah anda pasti mahu menambah pegawai baru ini? <br><b>Sila semak ejaan nama dan No. KP dengan teliti.</b>",
            () => {
                const pegawaiBaru = {
                    nama: valNama,
                    ic: valKp,
                    jawatan: inputJawatan.value || '-',
                    lokasi: inputLokasiUpdate.value || '-',
                    umur: 30, // Default dummy
                    gred: 'N/A',
                    tarikhLantik: inputTarikhLantik.value,
                    kelayakan1: inputKelayakan1.value,
                    kelayakan2: inputKelayakan2.value,
                    kelayakan3: inputKelayakan3.value,
                    history: {}
                };

                dataPegawai.push(pegawaiBaru);
                kosongkanBorangProfil();
                tunjukPopup('Pegawai baru berjaya ditambah!');
                renderDirektori();
            }
        );
    });
}

if (btnKemaskini) {
    btnKemaskini.addEventListener('click', (e) => {
        e.preventDefault();

        if (pegawaiSedangDieditIndex === null) {
            tunjukPopup('Sila cari dan pilih pegawai dahulu.', 'negatif');
            return;
        }

        tunjukConfirmation(
            "Perubahan ini akan dikemaskini secara kekal dalam rekod pegawai. <br><b>Teruskan pengemaskinian?</b>",
            () => {
                const p = dataPegawai[pegawaiSedangDieditIndex];
                p.nama = inputNama.value;
                p.ic = inputKp.value;
                p.jawatan = inputJawatan.value;
                p.lokasi = inputLokasiUpdate.value;
                p.tarikhLantik = inputTarikhLantik.value;
                p.kelayakan1 = inputKelayakan1.value;
                p.kelayakan2 = inputKelayakan2.value;
                p.kelayakan3 = inputKelayakan3.value;

                tunjukPopup('Data pegawai berjaya dikemaskini.');
                renderDirektori();
            }
        );
    });
}

if (btnHapus) {
    btnHapus.addEventListener('click', (e) => {
        e.preventDefault();
        if (pegawaiSedangDieditIndex === null) return;

        tunjukConfirmation(
            "<span class='text-red-500 font-bold'>AMARAN!</span> <br>Data ini akan dipadam sepenuhnya dan tidak boleh dikembalikan. Adakah anda pasti?",
            () => {
                dataPegawai.splice(pegawaiSedangDieditIndex, 1);
                kosongkanBorangProfil();
                tunjukPopup('Rekod pegawai berjaya dihapus.');
                renderDirektori();
            }
        );
    });
}

// Logic Button Gred section
if (btnKosongkanGred) btnKosongkanGred.addEventListener('click', kosongkanBorangGred);

if (btnKemaskiniGred) {
    btnKemaskiniGred.addEventListener('click', () => {
        if (pegawaiSedangDieditGredIndex === null) {
            tunjukPopup('Sila cari pegawai gred dahulu.', 'negatif');
            return;
        }

        tunjukConfirmation(
            "Pastikan semua tarikh kenaikan pangkat dan status gred (KUP/FLEKSI/MEMANGKU) adalah tepat sebelum disimpan.",
            () => {
                const p = dataPegawai[pegawaiSedangDieditGredIndex];
                if (!p.history) p.history = {};

                const gradeIds = ['c9', 'c10', 'c12', 'c13', 'c14', 'jusa-c', 'jusa-b', 'jusa-a'];
                gradeIds.forEach(id => {
                    const dateInput = document.getElementById(`date-${id}`);
                    const dateVal = dateInput ? dateInput.value : '';

                    let statusVal = null;
                    const container = dateInput ? dateInput.nextElementSibling : null;
                    if (container) {
                        const activeBtns = container.querySelectorAll('.text-white.btn-toggle-status');
                        if (activeBtns.length > 0) {
                            const statuses = Array.from(activeBtns).map(b => b.dataset.status);
                            statusVal = statuses.join(', ');
                        }
                    }

                    p.history[id] = {
                        date: dateVal,
                        status: statusVal
                    };
                });

                tunjukPopup('Data gred berjaya disimpan!');
            }
        );
    });
}


// Status Button Toggles (Updated for exclusive per row logic)
// Status Button Toggles
const statusButtons = document.querySelectorAll('.btn-toggle-status');
statusButtons.forEach(btn => {
    btn.addEventListener('click', function () {
        // Global Single-Select Logic (User Requirement: Only 1 status active across ALL grades)

        const statusType = this.dataset.status;
        const baseColor = getColorName(statusType);
        const gradeIds = ['c9', 'c10', 'c12', 'c13', 'c14', 'jusa-c', 'jusa-b', 'jusa-a'];

        // 1. Get ALL status buttons in the entire form
        const allStatusButtons = document.querySelectorAll('.btn-toggle-status');

        // 2. Loop through all buttons
        allStatusButtons.forEach(b => {
            // Ignore the button that was just clicked (we handle it last)
            if (b !== this) {
                // Deactivate all others
                const bType = b.dataset.status;
                const bColor = getColorName(bType);
                b.classList.remove(`bg-${bColor}-500`, 'text-white');
                b.classList.add(`text-${bColor}-600`, `hover:bg-${bColor}-50`);
            }
        });

        // 3. Toggle the clicked button
        if (this.classList.contains('text-white')) {
            // Deactivate (Allow unchecking)
            this.classList.remove(`bg-${baseColor}-500`, 'text-white');
            this.classList.add(`text-${baseColor}-600`, `hover:bg-${baseColor}-50`);
        } else {
            // Activate
            this.classList.remove(`text-${baseColor}-600`, `hover:bg-${baseColor}-50`);
            this.classList.add(`bg-${baseColor}-500`, 'text-white');
        }

        recalcSummary(gradeIds);
    });
});

function recalcSummary(gradeIds) {
    const summaryData = { 'KUP': [], 'FLEKSI': [], 'MEMANGKU': [] };

    gradeIds.forEach(id => {
        const dateInput = document.getElementById(`date-${id}`);
        const container = dateInput ? dateInput.nextElementSibling : null;
        if (container) {
            const activeBtns = container.querySelectorAll('.text-white.btn-toggle-status');
            activeBtns.forEach(btn => {
                const label = container.parentElement.querySelector('label').innerText;
                const type = btn.dataset.status;
                if (summaryData[type]) summaryData[type].push(label);
            });
        }
    });

    updateSummary('KUP', summaryData['KUP'].length > 0 ? summaryData['KUP'].join(', ') : '-');
    updateSummary('FLEKSI', summaryData['FLEKSI'].length > 0 ? summaryData['FLEKSI'].join(', ') : '-');
    updateSummary('MEMANGKU', summaryData['MEMANGKU'].length > 0 ? summaryData['MEMANGKU'].join(', ') : '-');
}

function updateSummary(type, text) {
    const summaryKup = document.getElementById('summary-kup');
    const summaryFleksi = document.getElementById('summary-fleksi');
    const summaryMemangku = document.getElementById('summary-memangku');

    if (type === 'KUP') summaryKup.innerText = text;
    if (type === 'FLEKSI') summaryFleksi.innerText = text;
    if (type === 'MEMANGKU') summaryMemangku.innerText = text;
}



// ==========================================
// 13. MODUL BUTIRAN PEGAWAI (NEW)
// ==========================================

const inputCarianButiran = document.getElementById('carian-butiran-input');
const hasilCarianButiran = document.getElementById('hasil-carian-butiran');
const paparanButiran = document.getElementById('paparan-butiran-pegawai');

// Detail Elements
const butiranAvatar = document.getElementById('butiran-avatar');
const butiranNama = document.getElementById('butiran-nama');
const butiranJawatan = document.getElementById('butiran-jawatan');
const butiranGredBadge = document.getElementById('butiran-gred-badge');
const butiranLokasi = document.getElementById('butiran-lokasi');
const butiranTarikhLantik = document.getElementById('butiran-tarikh-lantik');
const butiranIc = document.getElementById('butiran-ic');
const butiranDob = document.getElementById('butiran-dob');
const butiranUmur = document.getElementById('butiran-umur');
const butiranKelayakan = document.getElementById('butiran-kelayakan');
const butiranHistoryContainer = document.getElementById('butiran-history-container');
const butiranCatatan = document.getElementById('butiran-catatan');
const btnSimpanCatatan = document.getElementById('btn-simpan-catatan');

let currentButiranIndex = null;

// Helper: Extract DOB from IC
function getDobFromIc(ic) {
    if (!ic || ic.length < 6) return '-';
    // Format: YYMMDD-SS-####
    const yy = ic.substring(0, 2);
    const mm = ic.substring(2, 4);
    const dd = ic.substring(4, 6);

    // Estimate century (logic simple: > 30 = 19yy, else 20yy) - adjustments needed for strictness but okay for dummy
    const yearPrefix = parseInt(yy) > 30 ? '19' : '20';
    const year = yearPrefix + yy;

    // Convert month number to name
    const dateObj = new Date(`${year}-${mm}-${dd}`);
    if (isNaN(dateObj)) return ic; // Fallback

    return dateObj.toLocaleDateString('ms-MY', { day: 'numeric', month: 'long', year: 'numeric' });
}

// Setup Search Logic
if (inputCarianButiran && hasilCarianButiran) {
    setupCarianDropdown(inputCarianButiran, hasilCarianButiran, (pegawai, index) => {
        renderButiran(pegawai, index);
    });
}

function renderButiran(pegawai, index) {
    currentButiranIndex = index;

    // Show container
    paparanButiran.classList.remove('hidden');

    // Avatar
    butiranAvatar.innerText = pegawai.nama.charAt(0);

    // Basic Info
    butiranNama.innerText = pegawai.nama;
    butiranJawatan.innerText = pegawai.jawatan || '-';
    butiranGredBadge.innerText = pegawai.gred || '-';
    butiranLokasi.innerText = pegawai.lokasi || '-';

    // Dates
    butiranTarikhLantik.innerText = pegawai.tarikhLantik ? new Date(pegawai.tarikhLantik).toLocaleDateString('ms-MY', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Tiada Rekod';

    // Personal Grid
    butiranIc.innerText = pegawai.ic;
    butiranDob.innerText = getDobFromIc(pegawai.ic);
    butiranUmur.innerText = pegawai.umur;
    butiranKelayakan.innerText = pegawai.kelayakan1 || 'Tiada Rekod';

    // History Timeline
    renderHistoryTimeline(pegawai.history);

    // Notes
    butiranCatatan.value = pegawai.catatan || ''; // Load existing note or empty

    // Scroll to details
    paparanButiran.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function renderHistoryTimeline(history) {
    butiranHistoryContainer.innerHTML = '';

    if (!history || Object.keys(history).length === 0) {
        butiranHistoryContainer.innerHTML = '<p class="text-sm text-slate-400 italic pl-2">Tiada rekod sejarah kenaikan pangkat.</p>';
        return;
    }

    // Sort valid entries by date
    const gradeMap = {
        'c9': 'Gred C9',
        'c10': 'Gred 10',
        'c12': 'Gred 12',
        'c13': 'Gred 13',
        'c14': 'Gred 14',
        'jusa-c': 'JUSA C',
        'jusa-b': 'JUSA B',
        'jusa-a': 'JUSA A'
    };

    const entries = Object.entries(history)
        .filter(([_, data]) => data && data.date)
        .sort((a, b) => new Date(b[1].date) - new Date(a[1].date)); // Newest first

    if (entries.length === 0) {
        butiranHistoryContainer.innerHTML = '<p class="text-sm text-slate-400 italic pl-2">Tiada rekod sejarah direkodkan.</p>';
        return;
    }

    entries.forEach(([key, data], idx) => {
        const isLatest = idx === 0;
        const statusText = data.status || 'STANDARD';
        const statusColor = getColorName(statusText);

        const item = document.createElement('div');
        item.className = 'relative pb-8 last:pb-0'; // Increased spacing

        // Logic: Hide 'STANDARD', show others
        let statusBadge = '';
        if (statusText !== 'STANDARD') {
            statusBadge = `
                <span class="text-[10px] font-bold px-2 py-1 rounded-md text-${statusColor}-700 bg-${statusColor}-100 border border-${statusColor}-200 ml-2">
                    ${statusText}
                </span>
            `;
        }

        item.innerHTML = `
            <span class="absolute -left-[25px] top-1.5 w-4 h-4 rounded-full border-2 border-white ${isLatest ? 'bg-indigo-600 ring-4 ring-indigo-100' : 'bg-slate-300'}"></span>
            
            <div class="flex flex-col gap-1">
                <div class="flex items-center justify-between w-full">
                    <div class="flex items-center">
                        <span class="text-base font-bold ${isLatest ? 'text-indigo-700' : 'text-slate-700'}">${gradeMap[key]}</span>
                        ${statusBadge}
                        ${isLatest ? '<span class="ml-2 text-[10px] font-bold text-white bg-indigo-600 px-2 py-1 rounded-full shadow-sm shadow-indigo-200 uppercase tracking-wider">Terkini</span>' : ''}
                    </div>
                    <span class="text-sm font-semibold text-slate-700 bg-slate-100 px-3 py-1 rounded-lg border border-slate-200 shadow-sm">
                        ${data.date}
                    </span>
                </div>
            </div>
        `;

        butiranHistoryContainer.appendChild(item);
    });
}

// Simpan Catatan Logic
if (btnSimpanCatatan) {
    btnSimpanCatatan.addEventListener('click', () => {
        if (currentButiranIndex === null) return;

        const text = butiranCatatan.value.trim();

        // Simpan dalam object pegawai (In-Memory)
        dataPegawai[currentButiranIndex].catatan = text;

        tunjukPopup('Catatan pegawai berjaya disimpan.', 'positif');
    });
}

// ==========================================
// 13. TOOLTIP CARTA INTERAKTIF (MANUAL)
// ==========================================
// Kerana kita guna CSS Conic Gradient, kita perlu kira sudut tetikus manual
// untuk tahu slice mana yang sedang di-hover.

const chartGender = document.getElementById('chart-visual-gender');
const chartAge = document.getElementById('chart-visual-age');

// Create Tooltip Element once
const chartTooltip = document.createElement('div');
chartTooltip.id = 'custom-chart-tooltip';
chartTooltip.className = 'fixed z-50 pointer-events-none hidden transition-opacity duration-200';
chartTooltip.innerHTML = `
    <div class="bg-slate-800 text-white text-xs rounded-lg py-2 px-3 shadow-xl border border-slate-700">
        <div class="font-bold flex items-center gap-2 mb-1">
            <span id="tooltip-dot" class="w-2 h-2 rounded-full bg-white"></span>
            <span id="tooltip-label">Label</span>
        </div>
        <div class="flex justify-between gap-4">
            <span class="text-slate-400">Jumlah:</span>
            <span id="tooltip-value" class="font-bold">0</span>
        </div>
        <div class="flex justify-between gap-4">
            <span class="text-slate-400">Peratus:</span>
            <span id="tooltip-percent" class="font-bold text-indigo-400">0%</span>
        </div>
    </div>
`;
document.body.appendChild(chartTooltip);

const elemLabel = chartTooltip.querySelector('#tooltip-label');
const elemValue = chartTooltip.querySelector('#tooltip-value');
const elemPercent = chartTooltip.querySelector('#tooltip-percent');
const elemDot = chartTooltip.querySelector('#tooltip-dot');

function handleChartTooltip(e, type) {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left; // x position within the element
    const y = e.clientY - rect.top;  // y position within the element

    // Calculate center
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    // Calculate Angle (Degrees: 0 - 360)
    // Math.atan2 returns radians -PI to PI. We convert to 0-360 deg.
    // 0 deg is typically 3 o'clock. We want 0 deg at 12 o'clock for easier CSS mapping?
    // Actually CSS conic-gradient 'from 0deg' starts at 12 o'clock (top).
    // Math.atan2(y,x):
    // x positive right, y positive down.
    // 12 o'clock: x=0, y=-1 -> -PI/2

    const dx = x - centerX;
    const dy = y - centerY;
    let angleRad = Math.atan2(dy, dx);
    let angleDeg = angleRad * (180 / Math.PI); // -180 to 180

    // Adjust to match CSS (0 deg at top 12:00)
    // CSS standard: 0deg = top.
    // JS Atan2: 0deg = right (3:00).
    // So distinct = angle + 90.
    angleDeg = angleDeg + 90;

    // Normalize to 0-360
    if (angleDeg < 0) angleDeg += 360;

    let data = null;

    if (type === 'gender') {
        // Gender Chart: from 0deg
        // 0% - 57% -> Blue (Lelaki)
        // 57% - 100% -> Pink (Wanita)
        // 57% * 3.6 = 205.2 deg

        if (angleDeg <= 205.2) {
            data = { label: 'Lelaki', value: 140, percent: '57%', color: '#3b82f6' };
        } else {
            data = { label: 'Wanita', value: 105, percent: '43%', color: '#ec4899' };
        }
    } else if (type === 'age') {
        // Age Chart: from 180deg (starts at Bottom 6:00)
        // So we need to shift our angle logic to match "from 180deg"
        // Let's normalize angle relative to 180 (Bottom) being 0 progress?
        // Or simply: 
        // CSS: 
        // 0% - 26%: Blue (#3b82f6) -> Starts at 180deg
        // 26% - 80% (54%): Indigo (#6366f1)
        // 80% - 100% (20%): Orange (#f97316)

        // Let's map degrees on the circle (0 at top, 180 at bottom)
        // 180 (Bottom) -> + (26% * 3.6 = 93.6deg) = 273.6
        // Segment 1 (Muda): 180 to 273.6
        // Segment 2 (Mid): 273.6 to (273.6 + 54%*3.6=194.4) = 468 (wraps) -> 108
        // Segment 3 (Senior): The rest (108 to 180)

        // Simplified Logic using normalize rotation:
        // Current angleDeg is 0 at top-center.

        const deg = angleDeg;

        // Boundaries:
        // Muda (Blue): 180 -> 273.6
        // Pertengahan (Indigo): 273.6 -> 360, THEN 0 -> 108
        // Senior (Orange): 108 -> 180

        if (deg >= 180 && deg < 273.6) {
            data = { label: 'Muda (18-29)', value: 64, percent: '26%', color: '#3b82f6' };
        } else if (deg >= 273.6 || deg < 108) {
            data = { label: 'Pertengahan (30-44)', value: 132, percent: '54%', color: '#6366f1' };
        } else {
            data = { label: 'Senior (45+)', value: 49, percent: '20%', color: '#f97316' };
        }
    }

    // Show Tooltip
    if (data) {
        chartTooltip.classList.remove('hidden');
        chartTooltip.style.left = (e.pageX + 15) + 'px';
        chartTooltip.style.top = (e.pageY + 15) + 'px';

        elemLabel.innerText = data.label;
        elemValue.innerText = data.value;
        elemPercent.innerText = data.percent;
        elemDot.style.backgroundColor = data.color;
    }
}

function hideChartTooltip() {
    chartTooltip.classList.add('hidden');
}

if (chartGender) {
    chartGender.addEventListener('mousemove', (e) => handleChartTooltip(e, 'gender'));
    chartGender.addEventListener('mouseleave', hideChartTooltip);
}

if (chartAge) {
    chartAge.addEventListener('mousemove', (e) => handleChartTooltip(e, 'age'));
    chartAge.addEventListener('mouseleave', hideChartTooltip);
}
