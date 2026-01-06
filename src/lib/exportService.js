/**
 * Export Service for Professor Reports
 * Uses xlsx-js-style for professionally styled Excel generation
 * 
 * Features:
 * - Header styling with company colors
 * - Alternating row colors
 * - Borders and proper alignment
 * - Status color coding (green for passing, red for failing)
 */

import XLSX from 'xlsx-js-style';

// Brand colors
const COLORS = {
    primary: '1E5AA8',      // Deep blue
    secondary: '3B82F6',    // Light blue
    success: '22C55E',      // Green
    warning: 'F59E0B',      // Amber
    danger: 'EF4444',       // Red
    headerBg: '1E3A5F',     // Dark blue header
    headerText: 'FFFFFF',   // White text
    altRow: 'F0F7FF',       // Light blue alternate
    sectionBg: 'E5F0FF',    // Section header bg
};

// Common styles
const headerStyle = {
    font: { bold: true, color: { rgb: COLORS.headerText }, sz: 12 },
    fill: { fgColor: { rgb: COLORS.headerBg }, patternType: 'solid' },
    alignment: { horizontal: 'center', vertical: 'center' },
    border: {
        top: { style: 'thin', color: { rgb: '000000' } },
        bottom: { style: 'thin', color: { rgb: '000000' } },
        left: { style: 'thin', color: { rgb: '000000' } },
        right: { style: 'thin', color: { rgb: '000000' } }
    }
};

const cellBorder = {
    top: { style: 'thin', color: { rgb: 'CCCCCC' } },
    bottom: { style: 'thin', color: { rgb: 'CCCCCC' } },
    left: { style: 'thin', color: { rgb: 'CCCCCC' } },
    right: { style: 'thin', color: { rgb: 'CCCCCC' } }
};

const sectionStyle = {
    font: { bold: true, color: { rgb: COLORS.primary }, sz: 11 },
    fill: { fgColor: { rgb: COLORS.sectionBg }, patternType: 'solid' },
    alignment: { horizontal: 'left', vertical: 'center' },
    border: cellBorder
};

/**
 * Export student progress data to Excel with professional styling
 */
export function exportStudentProgress(students, options = {}) {
    const {
        filename = 'student_progress_report',
        includeTimestamp = true,
        highlightFailing = true,
        failingThreshold = 60
    } = options;

    // Group students by school year, year level, and section
    const groupedData = groupStudents(students);

    // Create workbook
    const wb = XLSX.utils.book_new();

    // Create styled summary sheet
    const summarySheet = createStyledSummarySheet(students, failingThreshold);
    XLSX.utils.book_append_sheet(wb, summarySheet, 'Summary');

    // Create sheet for each school year
    Object.entries(groupedData).forEach(([schoolYear, yearLevels]) => {
        const sheet = createStyledStudentSheet(yearLevels, failingThreshold);
        const sheetName = schoolYear.replace(/[^a-zA-Z0-9-]/g, '_').substring(0, 31);
        XLSX.utils.book_append_sheet(wb, sheet, sheetName);
    });

    // Generate filename
    const timestamp = includeTimestamp ? `_${new Date().toISOString().split('T')[0]}` : '';
    const finalFilename = `${filename}${timestamp}.xlsx`;

    // Download file
    XLSX.writeFile(wb, finalFilename);
}

/**
 * Create a professionally styled summary sheet
 */
function createStyledSummarySheet(students, failingThreshold) {
    const ws = {};

    const totalStudents = students.length;
    const studentsWithScores = students.filter(s => s.gamesPlayed > 0);
    const avgScores = studentsWithScores.map(s =>
        s.gamesPlayed > 0 ? s.totalScore / s.gamesPlayed : 0
    );
    const failingStudents = avgScores.filter(avg => avg < failingThreshold).length;
    const passingStudents = studentsWithScores.length - failingStudents;
    const overallAverage = avgScores.length > 0
        ? Math.round(avgScores.reduce((a, b) => a + b, 0) / avgScores.length)
        : 0;

    // Game breakdown
    const gameStats = {};
    students.forEach(student => {
        if (student.gameBreakdown) {
            Object.entries(student.gameBreakdown).forEach(([game, data]) => {
                if (!gameStats[game]) {
                    gameStats[game] = { plays: 0, totalScore: 0 };
                }
                gameStats[game].plays += data.plays || 0;
                gameStats[game].totalScore += data.totalScore || 0;
            });
        }
    });

    // Title row
    ws['A1'] = {
        v: 'CTRL-C ACADEMY',
        s: {
            font: { bold: true, sz: 18, color: { rgb: COLORS.primary } },
            alignment: { horizontal: 'center' }
        }
    };
    ws['A2'] = {
        v: 'Student Progress Report',
        s: {
            font: { bold: true, sz: 14, color: { rgb: '666666' } },
            alignment: { horizontal: 'center' }
        }
    };
    ws['A3'] = {
        v: `Generated: ${new Date().toLocaleString()}`,
        s: {
            font: { sz: 10, color: { rgb: '999999' } },
            alignment: { horizontal: 'center' }
        }
    };

    // Merge cells for title
    ws['!merges'] = [
        { s: { r: 0, c: 0 }, e: { r: 0, c: 2 } },
        { s: { r: 1, c: 0 }, e: { r: 1, c: 2 } },
        { s: { r: 2, c: 0 }, e: { r: 2, c: 2 } }
    ];

    // Overview Section Header (row 5)
    ws['A5'] = { v: 'OVERVIEW', s: { ...sectionStyle, font: { bold: true, sz: 12, color: { rgb: COLORS.headerBg } } } };
    ws['B5'] = { v: '', s: sectionStyle };
    ws['C5'] = { v: '', s: sectionStyle };

    // Overview Data
    const overviewData = [
        ['Total Students', totalStudents, '📊'],
        ['Active Students', studentsWithScores.length, '👥'],
        ['Overall Average', overallAverage + ' pts', '📈'],
    ];

    overviewData.forEach((row, idx) => {
        const rowNum = 6 + idx;
        ws[`A${rowNum}`] = {
            v: row[0],
            s: { font: { bold: true }, border: cellBorder, fill: { fgColor: { rgb: idx % 2 === 0 ? 'FFFFFF' : COLORS.altRow }, patternType: 'solid' } }
        };
        ws[`B${rowNum}`] = {
            v: row[1],
            s: { alignment: { horizontal: 'right' }, border: cellBorder, fill: { fgColor: { rgb: idx % 2 === 0 ? 'FFFFFF' : COLORS.altRow }, patternType: 'solid' }, font: { bold: true, color: { rgb: COLORS.primary } } }
        };
        ws[`C${rowNum}`] = {
            v: row[2],
            s: { alignment: { horizontal: 'center' }, border: cellBorder, fill: { fgColor: { rgb: idx % 2 === 0 ? 'FFFFFF' : COLORS.altRow }, patternType: 'solid' } }
        };
    });

    // Performance Section Header (row 10)
    ws['A10'] = { v: 'PERFORMANCE', s: { ...sectionStyle, font: { bold: true, sz: 12, color: { rgb: COLORS.headerBg } } } };
    ws['B10'] = { v: '', s: sectionStyle };
    ws['C10'] = { v: '', s: sectionStyle };

    // Performance Data
    const passRate = studentsWithScores.length > 0 ? Math.round((passingStudents / studentsWithScores.length) * 100) : 0;
    const perfData = [
        ['Students Passing (≥60 avg)', passingStudents, '✅'],
        ['Students Needing Support', failingStudents, '⚠️'],
        ['Pass Rate', passRate + '%', passRate >= 70 ? '🎉' : '📝'],
    ];

    perfData.forEach((row, idx) => {
        const rowNum = 11 + idx;
        const isPassingRow = row[0].includes('Passing');
        const isFailingRow = row[0].includes('Support');

        ws[`A${rowNum}`] = {
            v: row[0],
            s: { font: { bold: true }, border: cellBorder, fill: { fgColor: { rgb: idx % 2 === 0 ? 'FFFFFF' : COLORS.altRow }, patternType: 'solid' } }
        };
        ws[`B${rowNum}`] = {
            v: row[1],
            s: {
                alignment: { horizontal: 'right' },
                border: cellBorder,
                fill: { fgColor: { rgb: idx % 2 === 0 ? 'FFFFFF' : COLORS.altRow }, patternType: 'solid' },
                font: {
                    bold: true,
                    color: { rgb: isPassingRow ? COLORS.success : isFailingRow ? COLORS.danger : COLORS.primary }
                }
            }
        };
        ws[`C${rowNum}`] = {
            v: row[2],
            s: { alignment: { horizontal: 'center' }, border: cellBorder, fill: { fgColor: { rgb: idx % 2 === 0 ? 'FFFFFF' : COLORS.altRow }, patternType: 'solid' } }
        };
    });

    // Game Activity Section Header (row 15)
    ws['A15'] = { v: 'GAME ACTIVITY', s: { ...sectionStyle, font: { bold: true, sz: 12, color: { rgb: COLORS.headerBg } } } };
    ws['B15'] = { v: '', s: sectionStyle };
    ws['C15'] = { v: '', s: sectionStyle };

    // Game stats
    let gameRowNum = 16;
    Object.entries(gameStats).forEach(([game, data], idx) => {
        ws[`A${gameRowNum}`] = {
            v: formatGameName(game),
            s: { font: { bold: true }, border: cellBorder, fill: { fgColor: { rgb: idx % 2 === 0 ? 'FFFFFF' : COLORS.altRow }, patternType: 'solid' } }
        };
        ws[`B${gameRowNum}`] = {
            v: `${data.plays} plays`,
            s: { alignment: { horizontal: 'right' }, border: cellBorder, fill: { fgColor: { rgb: idx % 2 === 0 ? 'FFFFFF' : COLORS.altRow }, patternType: 'solid' } }
        };
        ws[`C${gameRowNum}`] = {
            v: `${data.totalScore} pts`,
            s: { alignment: { horizontal: 'right' }, border: cellBorder, fill: { fgColor: { rgb: idx % 2 === 0 ? 'FFFFFF' : COLORS.altRow }, patternType: 'solid' }, font: { color: { rgb: COLORS.primary } } }
        };
        gameRowNum++;
    });

    // Set column widths
    ws['!cols'] = [
        { wch: 28 },
        { wch: 18 },
        { wch: 12 }
    ];

    // Set range
    ws['!ref'] = `A1:C${Math.max(gameRowNum, 20)}`;

    return ws;
}

/**
 * Create styled student data sheet
 */
function createStyledStudentSheet(yearLevels, failingThreshold) {
    const ws = {};
    let rowNum = 1;

    // Headers
    const headers = ['Student Number', 'Name', 'Email', 'Games Played', 'Total Score', 'Avg Score', 'Status'];
    headers.forEach((header, idx) => {
        const col = String.fromCharCode(65 + idx);
        ws[`${col}1`] = { v: header, s: headerStyle };
    });
    rowNum = 2;

    // Process year levels and sections
    Object.entries(yearLevels).forEach(([yearLevel, sections]) => {
        Object.entries(sections).forEach(([section, sectionStudents]) => {
            // Section header row
            ws[`A${rowNum}`] = {
                v: `Year ${yearLevel} - Section ${section}`,
                s: {
                    font: { bold: true, sz: 11, color: { rgb: COLORS.headerBg } },
                    fill: { fgColor: { rgb: COLORS.sectionBg }, patternType: 'solid' },
                    border: cellBorder
                }
            };
            // Fill rest of section header row
            for (let i = 1; i < headers.length; i++) {
                const col = String.fromCharCode(65 + i);
                ws[`${col}${rowNum}`] = {
                    v: '',
                    s: {
                        fill: { fgColor: { rgb: COLORS.sectionBg }, patternType: 'solid' },
                        border: cellBorder
                    }
                };
            }
            rowNum++;

            // Student rows
            sectionStudents.forEach((student, idx) => {
                const avgScore = student.gamesPlayed > 0
                    ? Math.round(student.totalScore / student.gamesPlayed)
                    : 0;
                const isPassingStatus = avgScore >= failingThreshold;
                const status = student.gamesPlayed === 0 ? 'No Activity' : (isPassingStatus ? 'Passing' : 'Needs Support');
                const rowBgColor = idx % 2 === 0 ? 'FFFFFF' : COLORS.altRow;

                const baseStyle = {
                    border: cellBorder,
                    fill: { fgColor: { rgb: rowBgColor }, patternType: 'solid' }
                };

                ws[`A${rowNum}`] = { v: student.student_number || 'N/A', s: baseStyle };
                ws[`B${rowNum}`] = { v: student.full_name || 'Unknown', s: { ...baseStyle, font: { bold: true } } };
                ws[`C${rowNum}`] = { v: student.email || '', s: { ...baseStyle, font: { sz: 10 } } };
                ws[`D${rowNum}`] = { v: student.gamesPlayed || 0, s: { ...baseStyle, alignment: { horizontal: 'center' } } };
                ws[`E${rowNum}`] = { v: student.totalScore || 0, s: { ...baseStyle, alignment: { horizontal: 'center' }, font: { color: { rgb: COLORS.primary } } } };
                ws[`F${rowNum}`] = { v: avgScore, s: { ...baseStyle, alignment: { horizontal: 'center' }, font: { bold: true } } };
                ws[`G${rowNum}`] = {
                    v: status,
                    s: {
                        ...baseStyle,
                        alignment: { horizontal: 'center' },
                        font: {
                            bold: true,
                            color: { rgb: student.gamesPlayed === 0 ? '999999' : (isPassingStatus ? COLORS.success : COLORS.danger) }
                        }
                    }
                };
                rowNum++;
            });

            // Empty row between sections
            rowNum++;
        });
    });

    // Set column widths
    ws['!cols'] = [
        { wch: 15 },  // Student Number
        { wch: 25 },  // Name
        { wch: 30 },  // Email
        { wch: 14 },  // Games Played
        { wch: 12 },  // Total Score
        { wch: 11 },  // Avg Score
        { wch: 14 }   // Status
    ];

    // Set range
    ws['!ref'] = `A1:G${rowNum}`;

    return ws;
}

/**
 * Group students by school_year > year_level > section
 */
function groupStudents(students) {
    const grouped = {};

    students.forEach(student => {
        const schoolYear = student.school_year || 'Unknown Year';
        const yearLevel = student.year_level?.toString() || 'Unknown';
        const section = student.section || 'Unassigned';

        if (!grouped[schoolYear]) grouped[schoolYear] = {};
        if (!grouped[schoolYear][yearLevel]) grouped[schoolYear][yearLevel] = {};
        if (!grouped[schoolYear][yearLevel][section]) grouped[schoolYear][yearLevel][section] = [];

        grouped[schoolYear][yearLevel][section].push(student);
    });

    // Sort students within each section by name
    Object.values(grouped).forEach(yearLevels => {
        Object.values(yearLevels).forEach(sections => {
            Object.values(sections).forEach(sectionStudents => {
                sectionStudents.sort((a, b) =>
                    (a.full_name || '').localeCompare(b.full_name || '')
                );
            });
        });
    });

    return grouped;
}

/**
 * Format game type to readable name
 */
function formatGameName(gameType) {
    const names = {
        'fault_roulette': 'Fault Roulette',
        'service_writer': 'Service Writer',
        'cross_system': 'Cross-System Detective',
        'tool_selection': 'Tool Selection',
        'chain_reaction': 'Chain Reaction',
        'technician_detective': 'Technician Detective'
    };
    return names[gameType] || gameType;
}

/**
 * Export to CSV (simpler format, no styling)
 */
export function exportToCSV(students, filename = 'student_progress') {
    const csvData = students.map(student => {
        const avgScore = student.gamesPlayed > 0
            ? Math.round(student.totalScore / student.gamesPlayed)
            : 0;

        return {
            'Student Number': student.student_number || 'N/A',
            'Name': student.full_name || 'Unknown',
            'Email': student.email || '',
            'Year Level': student.year_level || '',
            'Section': student.section || '',
            'Semester': student.semester || '',
            'School Year': student.school_year || '',
            'Games Played': student.gamesPlayed || 0,
            'Total Score': student.totalScore || 0,
            'Average Score': avgScore,
            'Status': avgScore < 60 ? 'Needs Support' : 'Passing'
        };
    });

    const ws = XLSX.utils.json_to_sheet(csvData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Students');

    const timestamp = new Date().toISOString().split('T')[0];
    XLSX.writeFile(wb, `${filename}_${timestamp}.csv`);
}
