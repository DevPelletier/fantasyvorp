
// Full React-Data-Table styles
const white01 = "#FFFFFF";
const darkOverlay01 = "rgba(255, 255, 255, 0.05)";
const grey02 = "#424242";

export const customRDTStyles = {
    table: {
		style: {
			color: white01,
			backgroundColor: darkOverlay01,
		},
	},
    header: {
        style: {
          color: white01,
          backgroundColor: darkOverlay01,
          fontSize: '24px',
        }
    },
    head: {
		style: {
			// color: theme.text.primary,
			fontSize: '12px',
			fontWeight: 500,
		},
	},
	headCells: {
		style: {
			justifyContent: 'center',
			padding: '0 8px',
			fontWeight: '600',
		}
	},
    rows: {
		style: {
			fontSize: '13px',
			fontWeight: 400,
			color: white01,
			backgroundColor: darkOverlay01,
			minHeight: '48px',
			'&:not(:last-of-type)': {
				borderBottomStyle: 'solid',
				borderBottomWidth: '1px',
				borderBottomColor: grey02,
			},
		},
		denseStyle: {
			minHeight: '32px',
		},
		selectedHighlightStyle: {
			// use nth-of-type(n) to override other nth selectors
			'&:nth-of-type(n)': {
				// color: theme.selected.text,
				// backgroundColor: theme.selected.default,
				// borderBottomColor: theme.background.default,
			},
		},
		highlightOnHoverStyle: {
			backgroundColor: darkOverlay01,
			transitionDuration: '0.15s',
			transitionProperty: 'background-color',
			// borderBottomColor: theme.background.default,
			outlineStyle: 'solid',
			outlineWidth: '1px',
			// outlineColor: theme.background.default,
		},
		stripedStyle: {
			// color: theme.striped.text,
			backgroundColor: grey02,
		},
	},
    tableWrapper: {
		style: {
			display: 'table',
		},
	},
	responsiveWrapper: {
		style: {},
	},
    rows: {
      style: {
  
      }
    }, 
    cells: {
      style: {
		padding: '0 8px',
		justifyContent: 'center'
      }
    }
}

export const specificRDTStyles = [
    {
        when: column => column.fullName,
        style: {
            color: 'red'
        },
      },
];
  